
const mongoose = require("mongoose");

const StoreSlot = require("../models/StoreSlot");
const Store = require("../models/store");
const Trip = require("../models/trip");

const {
  checkSlotAvailability,
} = require("./conflictDetectionService");

// Create a consistent error
const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Validate reservation time
const validateSlotTime = (startAt, endAt) => {
  const start = new Date(startAt);
  const end = new Date(endAt);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
  ) {
    throw createError("Invalid reservation date or time.");
  }

  if (end <= start) {
    throw createError("End time must be later than start time.");
  }

  return { start, end };
};

// CREATE SLOT RESERVATION
const createSlot = async (slotData) => {
  const {
    store,
    trip,
    stopId,
    vehicle,
    operationType,
    startAt,
    endAt,
    notes,
  } = slotData;

  if (
    !store ||
    !trip ||
    !stopId ||
    !vehicle ||
    !operationType ||
    !startAt ||
    !endAt
  ) {
    throw createError("Please provide all required reservation details.");
  }

  //// Validate MongoDB IDs
  if (
    !mongoose.Types.ObjectId.isValid(store) ||
    !mongoose.Types.ObjectId.isValid(trip) ||
    !mongoose.Types.ObjectId.isValid(stopId)
  ) {
    throw createError("Invalid store, trip or stop ID.");
  }

  const { start, end } = validateSlotTime(startAt, endAt);

  const existingStore = await Store.findById(store);

  // Check whether the store exists
  if (!existingStore) {
    throw createError("Store not found.", 404);
  }

  // Check whether the trip exists
  const existingTrip = await Trip.findById(trip);

  if (!existingTrip) {
    throw createError("Trip not found.", 404);
  }

  // Check whether the stop belongs to this trip
  const existingStop = existingTrip.stops.id(stopId);

  if (!existingStop) {
    throw createError("The selected stop does not belong to this trip.");
  }

  // Check operating hours and dock availability
  await checkSlotAvailability({
    storeId: store,
    startAt: start,
    endAt: end,
  });

  const newSlot = await StoreSlot.create({
    store,
    trip,
    stopId,
    vehicle: vehicle.trim(),
    operationType,
    startAt: start,
    endAt: end,
    notes: notes || "",
  });

  return newSlot;
};

// GET ALL SLOT RESERVATIONS
const getSlots = async (filters = {}) => {
  const query = {};

  if (filters.store) query.store = filters.store;
  if (filters.trip) query.trip = filters.trip;
  if (filters.status) query.status = filters.status;
  if (filters.vehicle) query.vehicle = filters.vehicle;

  if (filters.startDate || filters.endDate) {
    query.startAt = {};

    if (filters.startDate) {
      query.startAt.$gte = new Date(filters.startDate);
    }

    if (filters.endDate) {
      query.startAt.$lte = new Date(filters.endDate);
    }
  }

  return await StoreSlot.find(query)
    .populate("store", "name code")
    .populate("trip", "id route status")
    .sort({ startAt: 1 });
};

// GET A SINGLE SLOT
const getSlotById = async (slotId) => {
  if (!mongoose.Types.ObjectId.isValid(slotId)) {
    throw createError("Invalid slot ID.");
  }

  const slot = await StoreSlot.findById(slotId)
    .populate("store", "name code")
    .populate("trip", "id route status");

  if (!slot) {
    throw createError("Slot reservation not found.", 404);
  }

  return slot;
};

// UPDATE SLOT RESERVATION
const updateSlot = async (slotId, updateData) => {
  if (!mongoose.Types.ObjectId.isValid(slotId)) {
    throw createError("Invalid slot ID.");
  }

  const slot = await StoreSlot.findById(slotId);

  if (!slot) {
    throw createError("Slot reservation not found.", 404);
  }

  if (["Cancelled", "Completed"].includes(slot.status)) {
    throw createError(
      "Cancelled or completed reservations cannot be updated."
    );
  }

  const allowedFields = [
    "vehicle",
    "operationType",
    "startAt",
    "endAt",
    "notes",
  ];

  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      slot[field] = updateData[field];
    }
  });

  const { start, end } = validateSlotTime(
    slot.startAt,
    slot.endAt
  );

  // Exclude this reservation from the conflict check
  await checkSlotAvailability({
    storeId: slot.store,
    startAt: start,
    endAt: end,
    excludeSlotId: slot._id,
  });

  await slot.save();

  return slot;
};

// CANCEL SLOT RESERVATION
const cancelSlot = async (slotId) => {
  if (!mongoose.Types.ObjectId.isValid(slotId)) {
    throw createError("Invalid slot ID.");
  }

  const slot = await StoreSlot.findById(slotId);

  if (!slot) {
    throw createError("Slot reservation not found.", 404);
  }

  if (slot.status === "Completed") {
    throw createError("Completed reservations cannot be cancelled.");
  }

  if (slot.status === "Cancelled") {
    throw createError("This reservation is already cancelled.");
  }

  slot.status = "Cancelled";

  await slot.save();

  return slot;
};

module.exports = {
  createSlot,
  getSlots,
  getSlotById,
  updateSlot,
  cancelSlot,
};
