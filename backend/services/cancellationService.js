const mongoose = require("mongoose");
const Booking = require("../models/booking");
const Trip = require("../models/trip");
const StoreSlot = require("../models/StoreSlot");
const {
  checkSlotScheduleAvailability,
  lockStoreReservations,
} = require("./conflictDetectionService");

const createError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const locationKeys = (location) => {
  const raw = String(location || "").trim();
  const values = [raw, ...(raw.match(/\(([^)]+)\)/g) || []).map((part) => part.slice(1, -1))];
  return [...new Set(values.map((value) => value.toLocaleLowerCase().replace(/[^a-z0-9]+/g, "")).filter(Boolean))];
};

const locationsMatch = (first, second) => {
  const firstKeys = locationKeys(first);
  const secondKeys = locationKeys(second);
  return firstKeys.some((firstKey) => secondKeys.some((secondKey) =>
    firstKey === secondKey || (Math.min(firstKey.length, secondKey.length) >= 6 && (firstKey.startsWith(secondKey) || secondKey.startsWith(firstKey)))
  ));
};

const parseWeightKg = (value) => {
  if (value == null || value === "") return null;
  const match = String(value).replace(/,/g, "").match(/(-?\d+(?:\.\d+)?)\s*(kg|kgs|kilograms?|g|grams?|t|tonnes?|tons?|lb|lbs)?/i);
  if (!match) return null;
  const amount = Number(match[1]);
  const unit = (match[2] || "kg").toLowerCase();
  if (!Number.isFinite(amount) || amount < 0) return null;
  if (unit === "g" || unit.startsWith("gram")) return amount / 1000;
  if (unit === "t" || unit.startsWith("ton")) return amount * 1000;
  if (unit === "lb" || unit === "lbs") return amount * 0.45359237;
  return amount;
};

const parseCount = (value) => {
  const match = String(value ?? "").replace(/,/g, "").match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : 0;
};

const calculateTripLoad = (bookings) => {
  let totalWeightKg = 0;
  let hasWeight = false;
  let totalItems = 0;

  for (const booking of bookings) {
    const bookingWeight = parseWeightKg(booking.weight);
    if (bookingWeight !== null) {
      totalWeightKg += bookingWeight;
      hasWeight = true;
    } else {
      const itemWeights = (booking.items || []).map((item) => parseWeightKg(item.weight)).filter((weight) => weight !== null);
      if (itemWeights.length) {
        totalWeightKg += itemWeights.reduce((sum, weight) => sum + weight, 0);
        hasWeight = true;
      }
    }

    const bookingCount = Number(booking.totalItems);
    totalItems += Number.isFinite(bookingCount)
      ? bookingCount
      : (booking.items || []).reduce((sum, item) => sum + parseCount(item.quantity), 0);
  }

  if (hasWeight) return `${Number(totalWeightKg.toFixed(1))} kg`;
  return `${Number(totalItems.toFixed(1))} Units`;
};

const rebuildTripStops = (trip, bookings) => {
  const requestedLocations = [];
  for (const booking of bookings) {
    for (const location of [booking.pickupStore, booking.destinationStore]) {
      const text = String(location || "").trim();
      if (text && !requestedLocations.some((existing) => locationsMatch(existing, text))) {
        requestedLocations.push(text);
      }
    }
  }

  // Keep the existing route order and subdocument IDs where possible so slot
  // reservations continue to reference the same stops.
  const stops = trip.stops
    .filter((stop) => requestedLocations.some((location) => locationsMatch(location, stop.location)))
    .map((stop) => stop.toObject());

  for (const location of requestedLocations) {
    if (stops.some((stop) => locationsMatch(location, stop.location))) continue;
    stops.push({
      type: stops.length ? "DROP" : "ORIGIN",
      location,
      time: "",
      window: "",
      items: [],
    });
  }

  return stops;
};

const cancelBooking = async (bookingId) => {
  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    throw createError(400, "Invalid booking ID.");
  }

  const session = await mongoose.startSession();
  let result;
  try {
    await session.withTransaction(async () => {
      const booking = await Booking.findById(bookingId).session(session);
      if (!booking) throw createError(404, "Booking not found.");
      if (booking.status === "Cancelled") throw createError(400, "This booking is already cancelled.");
      if (["Completed", "In Progress"].includes(booking.status)) {
        throw createError(400, "A booking that is in progress or completed cannot be cancelled.");
      }

      let tripResult = null;
      booking.status = "Cancelled";
      await booking.save({ session });

      if (booking.trip) {
        const trip = await Trip.findById(booking.trip).session(session);
        if (trip) {
          if (["In Progress", "Completed"].includes(trip.status)) {
            throw createError(400, "The linked trip is already in progress or completed.");
          }

          const activeBookingIds = trip.bookings.filter((id) => id.toString() !== booking._id.toString());
          const remainingBookings = activeBookingIds.length
            ? await Booking.find({
                _id: { $in: activeBookingIds },
                status: { $ne: "Cancelled" },
              }).session(session)
            : [];
          trip.bookings = remainingBookings.map((remainingBooking) => remainingBooking._id);

          const activeSlots = await StoreSlot.find({
            trip: trip._id,
            status: { $in: ["Reserved", "Confirmed", "Rescheduled"] },
          }).session(session);
          const replacedSlotIds = activeSlots.map((slot) => slot._id);
          const storeIds = [...new Set(activeSlots.map((slot) => slot.store.toString()))].sort();
          for (const storeId of storeIds) await lockStoreReservations(storeId, session);

          let cancelledReservationCount = 0;
          if (!remainingBookings.length) {
            trip.status = "Cancelled";
            trip.route = "";
            trip.origin = "";
            trip.destination = "";
            trip.load = "0 Units";
            trip.stops = [];
            if (activeSlots.length) {
              await StoreSlot.updateMany(
                { _id: { $in: replacedSlotIds } },
                { $set: { status: "Cancelled" } },
                { session }
              );
              cancelledReservationCount = activeSlots.length;
            }
          } else {
            trip.stops = rebuildTripStops(trip, remainingBookings);
            trip.origin = trip.stops[0]?.location || "";
            trip.destination = trip.stops[trip.stops.length - 1]?.location || "";
            trip.route = trip.stops.map((stop) => stop.location).join(" → ");
            trip.load = calculateTripLoad(remainingBookings);

            const validStopIds = new Set(trip.stops.map((stop) => stop._id.toString()));
            const orphanSlots = activeSlots.filter((slot) => !validStopIds.has(slot.stopId.toString()));
            if (orphanSlots.length) {
              await StoreSlot.updateMany(
                { _id: { $in: orphanSlots.map((slot) => slot._id) } },
                { $set: { status: "Cancelled" } },
                { session }
              );
              cancelledReservationCount = orphanSlots.length;
            }

            const retainedSlots = activeSlots.filter((slot) => validStopIds.has(slot.stopId.toString()));
            if (retainedSlots.length) {
              await checkSlotScheduleAvailability({
                proposedSlots: retainedSlots.map((slot) => ({
                  store: slot.store,
                  startAt: slot.startAt,
                  endAt: slot.endAt,
                })),
                replacedSlotIds,
                session,
              });
            }
          }

          trip.events.forEach((event) => { event.current = false; });
          trip.events.push({
            label: remainingBookings.length
              ? `Trip recalculated after booking ${booking.id} cancellation`
              : `Trip cancelled after booking ${booking.id} cancellation`,
            timestamp: new Date(),
            current: true,
          });
          await trip.save({ session });

          tripResult = {
            tripId: trip.id,
            status: trip.status,
            remainingBookings: remainingBookings.length,
            recalculated: remainingBookings.length > 0,
            route: trip.route,
            load: trip.load,
            activeReservationsRevalidated: Math.max(0, activeSlots.length - cancelledReservationCount),
            reservationsCancelled: cancelledReservationCount,
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

module.exports = { cancelBooking };
