const mongoose = require('mongoose');
const { StoreBooking } = require('../models/StoreBooking');
const Trip = require('../models/trip');
const StoreSlot = require('../models/StoreSlot');
const { checkSlotScheduleAvailability, lockStoreReservations } = require('./conflictDetectionService');

const fail = (statusCode, message) => Object.assign(new Error(message), { statusCode });
const storeLabel = (store) => store?.name || store?.code || String(store?._id || '');

const buildTripStops = (trip, bookings) => {
  const ordered = bookings.flatMap((booking) => booking.stops || [])
    .slice()
    .sort((a, b) => a.sequence - b.sequence)
    .map((stop) => ({ storeId: stop.store?._id || stop.store, location: storeLabel(stop.store), type: stop.stopType }));
  const unique = [];
  for (const stop of ordered) {
    const storeId = stop.storeId?.toString();
    if (!storeId || unique.some((item) => item.storeId.toString() === storeId)) continue;
    unique.push(stop);
  }

  return unique.map((stop, index) => {
    const previous = trip.stops.find((existing) =>
      existing.location.trim().toLowerCase() === stop.location.trim().toLowerCase()
    );
    return {
      ...(previous?._id ? { _id: previous._id } : {}),
      type: index === 0 ? 'ORIGIN' : 'DROP',
      location: stop.location,
      time: previous?.time || '',
      window: previous?.window || '',
      items: previous?.items || [],
    };
  });
};

const getRemainingLoad = (bookings) => {
  let weightKg = 0;
  let hasWeight = false;
  let count = 0;
  for (const booking of bookings) {
    for (const line of booking.items || []) {
      const quantity = Number(line.quantity) || 0;
      count += quantity;
      const unitWeight = Number(line.item?.weightKg);
      if (Number.isFinite(unitWeight) && unitWeight > 0) {
        weightKg += unitWeight * quantity;
        hasWeight = true;
      }
    }
  }
  return hasWeight ? `${Number(weightKg.toFixed(1))} kg` : `${Number(count.toFixed(1))} Units`;
};

const cancelStoreBooking = async ({ bookingId, actorId, reason = '' }) => {
  if (!mongoose.Types.ObjectId.isValid(bookingId)) throw fail(400, 'Invalid booking ID');
  const session = await mongoose.startSession();
  let result;
  try {
    await session.withTransaction(async () => {
      const booking = await StoreBooking.findById(bookingId).session(session);
      if (!booking) throw fail(404, 'Booking not found');
      if (!['Draft', 'Submitted', 'Changes Requested', 'Approved'].includes(booking.status)) {
        throw fail(400, `Cannot cancel booking when status is "${booking.status}"`);
      }

      const fromStatus = booking.status;
      booking.status = 'Cancelled';
      booking.changeHistory.push({
        action: 'CANCELLED',
        fromStatus,
        toStatus: 'Cancelled',
        changedBy: actorId && mongoose.Types.ObjectId.isValid(actorId) ? actorId : null,
        reason,
        changedAt: new Date(),
      });
      await booking.save({ session });

      let tripResult = null;
      if (booking.assignedTrip) {
        const trip = await Trip.findById(booking.assignedTrip).session(session);
        if (trip) {
          if (['In Progress', 'Completed'].includes(trip.status)) {
            throw fail(400, 'The assigned trip is already in progress or completed.');
          }
          const remainingBookings = await StoreBooking.find({
            assignedTrip: trip._id,
            status: { $ne: 'Cancelled' },
          }).populate('stops.store items.item').session(session);
          const activeSlots = await StoreSlot.find({
            trip: trip._id,
            status: { $in: ['Reserved', 'Confirmed', 'Rescheduled'] },
          }).session(session);
          const replacedSlotIds = activeSlots.map((slot) => slot._id);
          const storeIds = [...new Set(activeSlots.map((slot) => slot.store.toString()))].sort();
          for (const storeId of storeIds) await lockStoreReservations(storeId, session);

          if (!remainingBookings.length) {
            trip.status = 'Cancelled';
            trip.route = '';
            trip.origin = '';
            trip.destination = '';
            trip.load = '0 Units';
            trip.stops = [];
            if (activeSlots.length) {
              await StoreSlot.updateMany({ _id: { $in: replacedSlotIds } }, { $set: { status: 'Cancelled' } }, { session });
            }
          } else {
            trip.stops = buildTripStops(trip, remainingBookings);
            trip.route = trip.stops.map((stop) => stop.location).join(' → ');
            trip.origin = trip.stops[0]?.location || '';
            trip.destination = trip.stops[trip.stops.length - 1]?.location || '';
            trip.load = getRemainingLoad(remainingBookings);

            const stopIds = new Set(trip.stops.map((stop) => stop._id.toString()));
            const orphanSlots = activeSlots.filter((slot) => !stopIds.has(slot.stopId.toString()));
            if (orphanSlots.length) {
              await StoreSlot.updateMany({ _id: { $in: orphanSlots.map((slot) => slot._id) } }, { $set: { status: 'Cancelled' } }, { session });
            }
            const retainedSlots = activeSlots.filter((slot) => stopIds.has(slot.stopId.toString()));
            if (retainedSlots.length) {
              await checkSlotScheduleAvailability({
                proposedSlots: retainedSlots.map((slot) => ({ store: slot.store, startAt: slot.startAt, endAt: slot.endAt })),
                replacedSlotIds,
                session,
              });
            }
          }

          trip.events.forEach((event) => { event.current = false; });
          trip.events.push({
            label: remainingBookings.length ? `Trip recalculated after booking ${booking.bookingCode} cancellation` : `Trip cancelled after booking ${booking.bookingCode} cancellation`,
            timestamp: new Date(),
            current: true,
          });
          await trip.save({ session });
          tripResult = {
            id: trip.id,
            status: trip.status,
            load: trip.load,
            route: trip.route,
            remainingBookings: remainingBookings.length,
            activeReservationsRevalidated: remainingBookings.length ? activeSlots.length : 0,
          };
        }
      }
      result = { booking, trip: tripResult };
    });
  } finally {
    await session.endSession();
  }
  return result;
};

module.exports = { cancelStoreBooking };
