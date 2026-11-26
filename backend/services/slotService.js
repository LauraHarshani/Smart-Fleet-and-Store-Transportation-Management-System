
const mongoose = require("mongoose");

const StoreSlot = require("../models/StoreSlot");
const Store = require("../models/store");
const Trip = require("../models/trip");

const {
  checkSlotAvailability,
  lockStoreReservations,
} = require("./conflictDetectionService");

// Create a consistent error
const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const assertStoreScope = (slot, storeScope) => {
  const slotStoreId = slot.store?._id || slot.store;
  if (storeScope && slotStoreId.toString() !== storeScope.toString()) {
    throw createError("Slot reservation not found.", 404);
  }
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
const createSlot = async (slotData = {}, storeScope = null) => {
  const {
    store: requestedStore,
    trip,
    stopId,
    vehicle,
    operationType,
    startAt,
    endAt,
    notes,
  } = slotData;
  const store = storeScope || requestedStore;

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

  const session = await mongoose.startSession();
  let newSlot;
  try {
    await session.withTransaction(async () => {
      const existingStore = await Store.findById(store).session(session);
      if (!existingStore) throw createError("Store not found.", 404);

      const existingTrip = await Trip.findById(trip).session(session);
      if (!existingTrip) throw createError("Trip not found.", 404);
      if (!existingTrip.stops.id(stopId)) {
        throw createError("The selected stop does not belong to this trip.");
      }

      await lockStoreReservations(store, session);
      await checkSlotAvailability({ storeId: store, startAt: start, endAt: end, session });

      [newSlot] = await StoreSlot.create([{
        store,
        trip,
        stopId,
        vehicle: vehicle.trim(),
        operationType,
        startAt: start,
        endAt: end,
        notes: notes || "",
      }], { session });
    });
  } finally {
    await session.endSession();
  }
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
const getSlotById = async (slotId, storeScope = null) => {
  if (!mongoose.Types.ObjectId.isValid(slotId)) {
    throw createError("Invalid slot ID.");
  }

  const slot = await StoreSlot.findById(slotId)
    .populate("store", "name code")
    .populate("trip", "id route status");

  if (!slot) {
    throw createError("Slot reservation not found.", 404);
  }
  assertStoreScope(slot, storeScope);

  return slot;
};

// UPDATE SLOT RESERVATION
const updateSlot = async (slotId, updateData, storeScope = null) => {
  if (!mongoose.Types.ObjectId.isValid(slotId)) {
    throw createError("Invalid slot ID.");
  }

  const session = await mongoose.startSession();
  let updatedSlot;
  try {
    await session.withTransaction(async () => {
      const slot = await StoreSlot.findById(slotId).session(session);
      if (!slot) throw createError("Slot reservation not found.", 404);
      assertStoreScope(slot, storeScope);
      if (["Cancelled", "Completed"].includes(slot.status)) {
        throw createError("Cancelled or completed reservations cannot be updated.");
      }

      await lockStoreReservations(slot.store, session);
      const allowedFields = ["vehicle", "operationType", "startAt", "endAt", "notes"];
      allowedFields.forEach((field) => {
        if (updateData[field] !== undefined) slot[field] = updateData[field];
      });

      const { start, end } = validateSlotTime(slot.startAt, slot.endAt);
      await checkSlotAvailability({
        storeId: slot.store,
        startAt: start,
        endAt: end,
        excludeSlotId: slot._id,
        session,
      });
      await slot.save({ session });
      updatedSlot = slot;
    });
  } finally {
    await session.endSession();
  }
  return updatedSlot;
};

// CANCEL SLOT RESERVATION
const cancelSlot = async (slotId, storeScope = null) => {
  if (!mongoose.Types.ObjectId.isValid(slotId)) {
    throw createError("Invalid slot ID.");
  }

  const slot = await StoreSlot.findById(slotId);

  if (!slot) {
    throw createError("Slot reservation not found.", 404);
  }
  assertStoreScope(slot, storeScope);

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
