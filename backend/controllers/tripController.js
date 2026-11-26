const mongoose = require('mongoose');
const Trip = require('../models/trip');
const Booking = require('../models/booking');
const { StoreBooking } = require('../models/StoreBooking');
const Vehicle = require('../models/vehicle');
const StoreSlot = require('../models/StoreSlot');
const slotService = require('../services/slotService');
const { rescheduleTripSlots } = require('../services/reschedulingService');

const getTrips = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.date) {
      const date = new Date(req.query.date);
      if (Number.isNaN(date.getTime())) {
        return res.status(400).json({ success: false, message: 'A valid date filter is required.' });
      }
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      filter.date = { $gte: start, $lt: end };
    }
    const trips = await Trip.find(filter).sort({ date: 1, start: 1, createdAt: -1 });
    return res.status(200).json({ success: true, count: trips.length, trips });
  } catch (error) {
    console.error('getTrips error:', error);
    return res.status(500).json({ success: false, message: 'Unable to retrieve trips.' });
  }
};

const reportTripDelay = async (req, res) => {
  const delayMinutes = Number(req.body?.delayMinutes);
  if (!Number.isFinite(delayMinutes) || delayMinutes <= 0) {
    return res.status(400).json({ success: false, message: 'delayMinutes must be a positive number.' });
  }

  try {
    const result = await rescheduleTripSlots(req.params.id, delayMinutes);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    console.error('reportTripDelay error:', error);
    return res.status(500).json({ success: false, message: 'Unable to report trip delay.' });
  }
};

const createTrip = async (req, res) => {
  try {
    const payload = req.body;

    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return res.status(400).json({ success: false, message: 'A trip payload is required.' });
    }

    const route = typeof payload.route === 'string' ? payload.route.trim() : '';
    if (!route) {
      return res.status(400).json({ success: false, message: 'Route is required.' });
    }

    let date;
    if (payload.date) {
      date = new Date(payload.date);
      if (Number.isNaN(date.getTime())) {
        return res.status(400).json({ success: false, message: 'A valid trip date is required.' });
      }
    }

    if (payload.stops !== undefined && !Array.isArray(payload.stops)) {
      return res.status(400).json({ success: false, message: 'Trip stops must be an array.' });
    }

    const stops = (payload.stops || []).map((stop) => ({
      type: stop.type,
      location: String(stop.location || '').trim(),
      time: stop.time,
      window: stop.window,
      items: Array.isArray(stop.items) ? stop.items : []
    }));

    if (stops.some((stop) => !stop.location)) {
      return res.status(400).json({ success: false, message: 'Every trip stop must have a location.' });
    }

    if (payload.bookings !== undefined && !Array.isArray(payload.bookings)) {
      return res.status(400).json({ success: false, message: 'Trip bookings must be an array.' });
    }

    const bookingIds = payload.bookings || [];
    if (bookingIds.some((bookingId) => !mongoose.Types.ObjectId.isValid(bookingId))) {
      return res.status(400).json({ success: false, message: 'Every booking ID must be a valid ObjectId.' });
    }

    if (bookingIds.length > 0) {
      const foundCount = await Booking.countDocuments({ _id: { $in: bookingIds } });
      if (foundCount !== bookingIds.length) {
        return res.status(400).json({ success: false, message: 'One or more bookings do not exist.' });
      }
    }

    const trip = await Trip.create({
      route,
      origin: payload.origin,
      destination: payload.destination,
      date,
      start: payload.start,
      end: payload.end,
      actualStartAt: payload.actualStartAt || null,
      actualEndAt: payload.actualEndAt || null,
      vehicle: payload.vehicle,
      driver: payload.driver,
      load: payload.load,
      distance: payload.distance,
      transitTime: payload.transitTime,
      carbon: payload.carbon,
      status: payload.status || 'Draft',
      progress: payload.progress,
      stops,
      bookings: bookingIds,
      events: payload.events
    });

    if (bookingIds.length > 0) {
      const linkedStatus = ['Scheduled', 'In Progress', 'Completed', 'Cancelled'].includes(trip.status)
        ? trip.status
        : 'Scheduled';
      await Booking.updateMany(
        { _id: { $in: bookingIds } },
        {
          $set: {
            trip: trip._id,
            status: linkedStatus
          }
        }
      );
    }

    return res.status(201).json({
      success: true,
      message: 'Trip created successfully.',
      trip
    });
  } catch (error) {
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res.status(400).json({ success: false, message: error.message });
    }

    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'A trip with this ID already exists.' });
    }

    console.error('createTrip error:', error);
    return res.status(500).json({ success: false, message: 'Error creating trip.' });
  }
};

const parseSlotWindow = (startAt, endAt, label) => {
  const start = new Date(startAt);
  const end = new Date(endAt);
  if (!startAt || !endAt || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    const error = new Error(`${label} slot needs a valid start and an end after the start.`);
    error.statusCode = 400;
    throw error;
  }
  return { start, end };
};

// Allocate one approved StoreBooking, create its trip, and reserve both store stops atomically.
const allocateStoreBooking = async (req, res) => {
  const { bookingId, vehicleId, pickupSlot, destinationSlot } = req.body || {};
  if (!mongoose.Types.ObjectId.isValid(bookingId) || !mongoose.Types.ObjectId.isValid(vehicleId)) {
    return res.status(400).json({ success: false, message: 'A valid booking and fleet vehicle are required.' });
  }

  let session;
  try {
    const pickupWindow = parseSlotWindow(pickupSlot?.startAt, pickupSlot?.endAt, 'Pickup');
    const destinationWindow = parseSlotWindow(destinationSlot?.startAt, destinationSlot?.endAt, 'Destination');
    if (destinationWindow.start < pickupWindow.start) {
      return res.status(400).json({ success: false, message: 'Destination slot must be after the pickup slot begins.' });
    }

    session = await mongoose.startSession();
    let result;
    await session.withTransaction(async () => {
      const booking = await StoreBooking.findById(bookingId)
        .populate('pickupStore destinationStore items.item stops.store')
        .session(session);
      if (!booking) {
        const error = new Error('Store booking not found.'); error.statusCode = 404; throw error;
      }
      if (booking.status !== 'Approved') {
        const error = new Error('Only approved Store Bookings can be assigned to a trip.'); error.statusCode = 400; throw error;
      }
      if (booking.assignedTrip) {
        const error = new Error('This booking already has an assigned trip.'); error.statusCode = 409; throw error;
      }

      const vehicle = await Vehicle.findById(vehicleId).populate('assignedDriver').session(session);
      if (!vehicle || vehicle.status !== 'Available') {
        const error = new Error('Select an available fleet vehicle.'); error.statusCode = 400; throw error;
      }

      const vehicleRegistration = vehicle.registrationNumber;
      const tripStart = pickupWindow.start;
      const tripEnd = destinationWindow.end;
      const overlappingTrip = await Trip.findOne({
        vehicleRef: vehicle._id,
        status: { $nin: ['Cancelled', 'Completed'] },
        scheduledStartAt: { $lt: tripEnd },
        scheduledEndAt: { $gt: tripStart },
      }).session(session);
      const overlappingSlot = await StoreSlot.findOne({
        vehicle: vehicleRegistration,
        status: { $in: ['Reserved', 'Confirmed', 'Rescheduled'] },
        startAt: { $lt: tripEnd },
        endAt: { $gt: tripStart },
      }).session(session);
      if (overlappingTrip || overlappingSlot) {
        const error = new Error(`${vehicleRegistration} is already assigned during this time.`); error.statusCode = 409; throw error;
      }

      // A write on the vehicle serializes concurrent allocation transactions for the same unit.
      vehicle.allocationRevision = Number(vehicle.allocationRevision || 0) + 1;
      await vehicle.save({ session });

      const totalWeight = booking.items.reduce((sum, line) => sum + (Number(line.item?.weightKg || 0) * Number(line.quantity || 0)), 0);
      if (vehicle.capacityWeightKg > 0 && totalWeight > vehicle.capacityWeightKg) {
        const error = new Error(`Booking load (${totalWeight} kg) exceeds ${vehicleRegistration}'s ${vehicle.capacityWeightKg} kg capacity.`); error.statusCode = 400; throw error;
      }

      const bookingStops = [...booking.stops].sort((a, b) => a.sequence - b.sequence);
      if (bookingStops.length !== 2 || bookingStops.filter((stop) => stop.stopType === 'PICKUP').length !== 1 || bookingStops.filter((stop) => stop.stopType === 'DROP').length !== 1) {
        const error = new Error('Only bookings with one pickup and one destination stop can be allocated.'); error.statusCode = 400; throw error;
      }
      const pickupStop = bookingStops.find((stop) => stop.stopType === 'PICKUP');
      const destinationStop = bookingStops.find((stop) => stop.stopType === 'DROP');
      if (pickupStop.store._id?.toString() !== booking.pickupStore._id.toString() || destinationStop.store._id?.toString() !== booking.destinationStore._id.toString()) {
        const error = new Error('Booking pickup and destination stops do not match the selected stores.'); error.statusCode = 400; throw error;
      }
      const tripStops = bookingStops.map((stop, index) => {
        const store = stop.store;
        const window = stop.stopType === 'PICKUP' ? pickupWindow : destinationWindow;
        const stopType = stop.stopType === 'PICKUP' ? 'ORIGIN' : 'DROP';
        return {
          type: stopType,
          location: store?.name || 'Store',
          store: store?._id || store,
          time: window.start.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
          window: `${window.start.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}-${window.end.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`,
          items: booking.items.map((line) => `${line.item?.name || 'Item'} × ${line.quantity}`),
          bookingStopId: stop._id,
          sequence: index + 1,
        };
      });

      const [trip] = await Trip.create([{
        route: `${booking.pickupStore.name} → ${booking.destinationStore.name}`,
        origin: booking.pickupStore.name,
        destination: booking.destinationStore.name,
        date: tripStart,
        start: tripStops[0].time,
        end: tripStops[tripStops.length - 1].time,
        vehicle: vehicleRegistration,
        vehicleRef: vehicle._id,
        driver: vehicle.assignedDriver?.name || vehicle.assignedDriverName || '',
        load: `${totalWeight || booking.items.reduce((sum, line) => sum + Number(line.quantity || 0), 0)} ${totalWeight ? 'kg' : 'units'}`,
        status: 'Scheduled',
        progress: 0,
        scheduledStartAt: tripStart,
        scheduledEndAt: tripEnd,
        stops: tripStops.map(({ bookingStopId, sequence, ...stop }) => stop),
        storeBookings: [booking._id],
      }], { session });

      const createdSlots = [];
      for (let index = 0; index < bookingStops.length; index += 1) {
        const stop = bookingStops[index];
        const isPickup = stop.stopType === 'PICKUP';
        const window = isPickup ? pickupWindow : destinationWindow;
        const tripStop = trip.stops[index];
        const slot = await slotService.createSlot({
          store: stop.store._id || stop.store,
          trip: trip._id,
          stopId: tripStop._id,
          vehicle: vehicleRegistration,
          operationType: isPickup ? 'Loading' : 'Unloading',
          startAt: window.start,
          endAt: window.end,
          notes: `Store booking ${booking.bookingCode}`,
        }, session);
        stop.scheduledSlot = slot._id;
        createdSlots.push(slot);
      }

      booking.assignedTrip = trip._id;
      booking.assignedVehicle = vehicle._id;
      booking.changeHistory.push({
        action: 'TRIP_AND_VEHICLE_ALLOCATED',
        fromStatus: booking.status,
        toStatus: booking.status,
        changedBy: req.user?.userId,
        reason: `Assigned ${vehicleRegistration}; reserved pickup and destination slots`,
      });
      await booking.save({ session });
      result = { trip, slots: createdSlots, booking };
    });

    return res.status(201).json({
      success: true,
      message: 'Vehicle assigned, trip created, and both store slots reserved.',
      ...result,
    });
  } catch (error) {
    return res.status(error.statusCode || (error.name === 'ValidationError' ? 400 : 500)).json({
      success: false,
      message: error.message || 'Unable to allocate this Store Booking.',
    });
  } finally {
    if (session) await session.endSession();
  }
};

module.exports = { getTrips, createTrip, reportTripDelay, allocateStoreBooking };
