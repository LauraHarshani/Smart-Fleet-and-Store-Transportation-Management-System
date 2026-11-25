const mongoose = require("mongoose");

const StoreSlot = require("../models/StoreSlot");
const Trip = require("../models/trip");
const { checkSlotAvailability } = require("./conflictDetectionService");

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

  const trip = await Trip.findById(tripId);

  if (!trip) {
    throw createError("Trip not found.", 404);
  }

  const slots = await StoreSlot.find({
    trip: tripId,
    status: { $in: ["Reserved", "Confirmed", "Rescheduled"] },
  }).sort({ startAt: 1 });

  if (slots.length === 0) {
    return {
      tripId,
      updatedCount: 0,
      message: "No active reservations found for this trip.",
      slots: [],
    };
  }

  const delayMilliseconds = delayMinutes * 60 * 1000;

  // Calculate the new time windows for every reservation.
  const proposedSlots = slots.map((slot) => ({
    slot,
    startAt: new Date(slot.startAt.getTime() + delayMilliseconds),
    endAt: new Date(slot.endAt.getTime() + delayMilliseconds),
  }));

  // Check each proposed time against other reservations.
  // Exclude all reservations belonging to this trip because
  // their old time windows will be replaced together.
  for (const proposed of proposedSlots) {
    const result = await checkSlotAvailability({
      storeId: proposed.slot.store,
      startAt: proposed.startAt,
      endAt: proposed.endAt,
      excludeSlotId: proposed.slot._id,
    });

    if (!result.available) {
      throw createError(
        `Cannot reschedule slot ${proposed.slot.id}: ${result.message}`,
        409
      );
    }
  }

  // Check conflicts between the proposed reservations themselves.
  for (let i = 0; i < proposedSlots.length; i++) {
    for (let j = i + 1; j < proposedSlots.length; j++) {
      const first = proposedSlots[i];
      const second = proposedSlots[j];

      if (
        first.slot.store.toString() === second.slot.store.toString() &&
        first.startAt < second.endAt &&
        first.endAt > second.startAt
      ) {
        // These reservations may still be valid if the store has
        // more than one dock. The main availability service checks
        // capacity against existing records, so a full combined
        // simulation is needed before allowing this case.
        throw createError(
          "The proposed rescheduled reservations overlap at the same store. Please review dock capacity.",
          409
        );
      }
    }
  }

  // Save the new reservation times.
  for (const proposed of proposedSlots) {
    proposed.slot.startAt = proposed.startAt;
    proposed.slot.endAt = proposed.endAt;
    proposed.slot.status = "Rescheduled";

    await proposed.slot.save();
  }

  return {
    tripId,
    updatedCount: proposedSlots.length,
    message: "Trip reservations rescheduled successfully.",
    slots: proposedSlots.map(({ slot }) => slot),
  };
};

module.exports = { rescheduleTripSlots };
