const mongoose = require("mongoose");

const StoreSlot = require("../models/StoreSlot");
const Trip = require("../models/trip");
const {
  checkSlotScheduleAvailability,
  lockStoreReservations,
} = require("./conflictDetectionService");

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const rescheduleTripSlots = async (tripId, delayMinutes) => {
  if (!mongoose.Types.ObjectId.isValid(tripId)) {
    throw createError("Invalid trip ID.");
  }

  if (!Number.isFinite(delayMinutes) || delayMinutes <= 0) {
    throw createError("Delay must be a positive number of minutes.");
  }

  const session = await mongoose.startSession();
  let result;
  try {
    await session.withTransaction(async () => {
      const trip = await Trip.findById(tripId).session(session);
      if (!trip) throw createError("Trip not found.", 404);
      if (["Draft", "Pending", "Cancelled", "Completed"].includes(trip.status)) {
        throw createError(`A trip in ${trip.status} status cannot be delayed.`, 400);
      }

      const slots = await StoreSlot.find({
        trip: tripId,
        status: { $in: ["Reserved", "Confirmed", "Rescheduled"] },
      }).sort({ startAt: 1 }).session(session);

      const delayMilliseconds = delayMinutes * 60 * 1000;
      const proposedSlots = slots.map((slot) => ({
        slot,
        store: slot.store,
        startAt: new Date(slot.startAt.getTime() + delayMilliseconds),
        endAt: new Date(slot.endAt.getTime() + delayMilliseconds),
      }));

      if (proposedSlots.length) {
        const storeIds = [...new Set(proposedSlots.map(({ store }) => store.toString()))].sort();
        for (const storeId of storeIds) {
          await lockStoreReservations(storeId, session);
        }
        await checkSlotScheduleAvailability({
          proposedSlots,
          replacedSlotIds: slots.map((slot) => slot._id),
          session,
        });
      }

      for (const proposed of proposedSlots) {
        proposed.slot.startAt = proposed.startAt;
        proposed.slot.endAt = proposed.endAt;
        proposed.slot.status = "Rescheduled";
        await proposed.slot.save({ session });
      }

      trip.status = "Delayed";
      trip.events.forEach((event) => { event.current = false; });
      trip.events.push({
        label: `Trip delayed by ${delayMinutes} minutes`,
        timestamp: new Date(),
        current: true,
      });
      await trip.save({ session });

      result = {
        tripId,
        updatedCount: proposedSlots.length,
        message: proposedSlots.length
          ? "Trip marked delayed and reservations rescheduled successfully."
          : "Trip marked delayed; no active reservations needed rescheduling.",
        slots: proposedSlots.map(({ slot }) => slot),
        trip,
      };
    });
  } finally {
    await session.endSession();
  }

  return result;
};

module.exports = { rescheduleTripSlots };
