const Booking = require('../models/booking');

const createBooking = async (req, res) => {
  const payload = req.body;

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return res.status(400).json({ success: false, message: 'A booking payload is required.' });
  }

  const pickupStore = typeof payload.pickupStore === 'string' ? payload.pickupStore.trim() : '';
  const destinationStore = typeof payload.destinationStore === 'string'
    ? payload.destinationStore.trim()
    : '';
  const rawDate = payload.date || payload.dispatchDate;

  if (!pickupStore || !destinationStore || !rawDate) {
    return res.status(400).json({
      success: false,
      message: 'Pickup store, destination store, and date are required.'
    });
  }

  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) {
    return res.status(400).json({ success: false, message: 'A valid booking date is required.' });
  }

  const rawItems = payload.items === undefined ? [] : payload.items;
  if (!Array.isArray(rawItems)) {
    return res.status(400).json({ success: false, message: 'Booking items must be an array.' });
  }

  const items = rawItems.map((item) => ({
    name: String(item?.name || item?.itemType || '').trim(),
    quantity: item?.quantity == null ? '' : String(item.quantity).trim(),
    weight: item?.weight == null ? '' : String(item.weight).trim(),
    description: String(item?.description || item?.unit || '').trim()
  }));

  if (items.some((item) => !item.name)) {
    return res.status(400).json({ success: false, message: 'Every booking item must have a name.' });
  }

  try {
    const booking = await Booking.create({
      bookingType: payload.bookingType,
      store: req.user?.store || payload.store,
      pickupStore,
      destinationStore,
      pickupAddress: payload.pickupAddress,
      destinationAddress: payload.destinationAddress,
      date,
      scheduledTime: payload.scheduledTime || payload.timeSlot,
      timeSlot: payload.timeSlot,
      bay: payload.bay,
      priority: payload.priority,
      deliveryType: payload.deliveryType,
      distance: payload.distance,
      transitTime: payload.transitTime,
      vehicle: payload.vehicle,
      weight: payload.weight,
      totalItems: payload.totalItems ?? items.length,
      items,
      specialInstructions: payload.specialInstructions,
      directives: payload.directives,
      status: 'Pending'
    });

    return res.status(201).json({
      success: true,
      message: 'Booking created successfully.',
      booking
    });
  } catch (error) {
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res.status(400).json({ success: false, message: error.message });
    }

    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'A booking with this ID already exists.' });
    }

    console.error('createBooking error:', error);
    return res.status(500).json({ success: false, message: 'Error creating booking.' });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const result = await cancelBookingService(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully.",
      booking: result.booking,
      trip: result.trip
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }

    console.error("cancelBooking error:", error);

    return res.status(500).json({
      success: false,
      message: "Error cancelling booking."
    });
  }
};

module.exports = {
  createBooking,
  cancelBooking
};
