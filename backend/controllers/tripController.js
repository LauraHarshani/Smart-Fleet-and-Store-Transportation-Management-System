const mongoose = require('mongoose');
const Trip = require('../models/trip');
const Booking = require('../models/booking');
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

module.exports = { getTrips, createTrip, reportTripDelay };
