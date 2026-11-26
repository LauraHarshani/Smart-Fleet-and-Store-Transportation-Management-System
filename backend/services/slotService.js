const mongoose = require('mongoose');

const StoreSlot = require('../models/StoreSlot');
const Store = require('../models/store');
const Booking = require('../models/booking');
const { checkSlotAvailability } = require('../utils/slotValidator');

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const validateTimeRange = (startTime, endTime) => {
  const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
  if (!timePattern.test(startTime) || !timePattern.test(endTime)) {
    throw createError('Slot times must use 24-hour HH:mm format.');
  }
  if (endTime <= startTime) {
    throw createError('End time must be later than start time.');
  }
};

const validateObjectId = (id, label) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError(`Invalid ${label} ID.`);
  }
};

const ensureBookingBelongsToStore = async (bookingId, storeId) => {
  if (!bookingId) return null;
  validateObjectId(bookingId, 'booking');

  const booking = await Booking.findById(bookingId);
  if (!booking) throw createError('Booking not found.', 404);
  if (booking.store.toString() !== storeId.toString()) {
    throw createError('The booking does not belong to this store.', 403);
  }
  return booking;
};

const populateSlot = (query) => query
  .populate('store', 'name code')
  .populate({
    path: 'booking',
    select: 'bookingId type status vehicle',
    populate: { path: 'vehicle', select: 'registrationNumber type' },
  });

const createSlot = async (slotData, storeScope = null) => {
  const {
    store: requestedStore,
    date,
    startTime,
    endTime,
    bay,
    type,
    booking,
  } = slotData;
  const store = storeScope || requestedStore;

  if (!store || !date || !startTime || !endTime || !bay || !type) {
    throw createError('Please provide the store, date, time range, bay and slot type.');
  }
  validateObjectId(store, 'store');

  if (!['Inbound', 'Outbound'].includes(type)) {
    throw createError('Slot type must be Inbound or Outbound.');
  }
  validateTimeRange(startTime, endTime);

  const slotDate = new Date(date);
  if (Number.isNaN(slotDate.getTime())) throw createError('Invalid slot date.');

  const existingStore = await Store.findById(store);
  if (!existingStore) throw createError('Store not found.', 404);

  const existingBooking = await ensureBookingBelongsToStore(booking, store);
  const available = await checkSlotAvailability({
    storeId: store,
    date: slotDate,
    startTime,
    endTime,
    bay,
  });
  if (!available) throw createError('The selected bay already has an overlapping slot.', 409);

  const slot = await StoreSlot.create({
    store,
    date: slotDate,
    startTime,
    endTime,
    bay: bay.trim(),
    type,
    status: existingBooking ? 'Booked' : 'Available',
    booking: existingBooking?._id || null,
  });

  return populateSlot(StoreSlot.findById(slot._id));
};

const getSlots = async (filters = {}, storeScope = null) => {
  const query = {};
  const store = storeScope || filters.store;
  if (store) query.store = store;
  if (filters.status) query.status = filters.status;
  if (filters.type) query.type = filters.type;
  if (filters.bay) query.bay = filters.bay;

  if (filters.startDate || filters.endDate) {
    query.date = {};
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      if (Number.isNaN(startDate.getTime())) throw createError('Invalid start date.');
      query.date.$gte = startDate;
    }
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      if (Number.isNaN(endDate.getTime())) throw createError('Invalid end date.');
      query.date.$lte = endDate;
    }
  }

  return populateSlot(StoreSlot.find(query)).sort({ date: 1, startTime: 1 });
};

const getSlotById = async (slotId, storeScope = null) => {
  validateObjectId(slotId, 'slot');
  const query = { _id: slotId };
  if (storeScope) query.store = storeScope;

  const slot = await populateSlot(StoreSlot.findOne(query));
  if (!slot) throw createError('Slot reservation not found.', 404);
  return slot;
};

const updateSlot = async (slotId, updateData, storeScope = null) => {
  validateObjectId(slotId, 'slot');
  const query = { _id: slotId };
  if (storeScope) query.store = storeScope;

  const slot = await StoreSlot.findOne(query);
  if (!slot) throw createError('Slot reservation not found.', 404);

  const allowedFields = ['date', 'startTime', 'endTime', 'bay', 'type', 'status'];
  for (const field of allowedFields) {
    if (updateData[field] !== undefined) slot[field] = updateData[field];
  }

  if (updateData.booking !== undefined) {
    const booking = await ensureBookingBelongsToStore(updateData.booking, slot.store);
    slot.booking = booking?._id || null;
    if (booking && updateData.status === undefined) slot.status = 'Booked';
  }

  if (!['Inbound', 'Outbound'].includes(slot.type)) {
    throw createError('Slot type must be Inbound or Outbound.');
  }
  if (!['Available', 'Booked', 'Blocked'].includes(slot.status)) {
    throw createError('Invalid slot status.');
  }
  validateTimeRange(slot.startTime, slot.endTime);

  const slotDate = new Date(slot.date);
  if (Number.isNaN(slotDate.getTime())) throw createError('Invalid slot date.');
  if (slot.status !== 'Booked') slot.booking = null;
  if (slot.status === 'Booked' && !slot.booking) {
    throw createError('A booking is required for a booked slot.');
  }

  const available = await checkSlotAvailability({
    storeId: slot.store,
    date: slotDate,
    startTime: slot.startTime,
    endTime: slot.endTime,
    bay: slot.bay,
    excludeSlotId: slot._id,
  });
  if (!available) throw createError('The selected bay already has an overlapping slot.', 409);

  await slot.save();
  return populateSlot(StoreSlot.findById(slot._id));
};

const cancelSlot = async (slotId, storeScope = null) => {
  validateObjectId(slotId, 'slot');
  const query = { _id: slotId };
  if (storeScope) query.store = storeScope;

  const slot = await StoreSlot.findOne(query);
  if (!slot) throw createError('Slot reservation not found.', 404);
  if (slot.status !== 'Booked') {
    throw createError('Only booked slots can be cancelled.');
  }

  slot.status = 'Available';
  slot.booking = null;
  await slot.save();
  return populateSlot(StoreSlot.findById(slot._id));
};

module.exports = {
  createSlot,
  getSlots,
  getSlotById,
  updateSlot,
  cancelSlot,
};
