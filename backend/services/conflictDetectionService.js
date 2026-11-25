const Store = require("../models/store");
const StoreSlot = require("../models/StoreSlot");

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const lockStoreReservations = async (storeId, session) => {
  const result = await Store.updateOne(
    { _id: storeId },
    { $inc: { slotReservationRevision: 1 } },
    { session }
  );
  if (!result.matchedCount) throw createError("Store not found.", 404);
};

// Convert a date into minutes after midnight in Sri Lanka time
const getSriLankaMinutes = (date) => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Colombo",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const hour = Number(parts.find((p) => p.type === "hour").value);
  const minute = Number(parts.find((p) => p.type === "minute").value);

  return hour * 60 + minute;
};

// Get the local calendar date in Sri Lanka
const getSriLankaDate = (date) => {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Colombo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
};

// Convert HH:mm into minutes
const timeToMinutes = (time) => {
  if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(time || "")) {
    throw createError(`Invalid store operating time: ${time}`);
  }

  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

// Check whether the requested reservation fits store operating hours
const checkOperatingHours = (store, startAt, endAt) => {
  const openingTime = store.operatingHours?.open;
  const closingTime = store.operatingHours?.close;

  if (!openingTime || !closingTime) {
    throw createError("Store operating hours are not configured.");
  }

  const openingMinutes = timeToMinutes(openingTime);
  const closingMinutes = timeToMinutes(closingTime);

  if (closingMinutes <= openingMinutes) {
    throw createError(
      "Overnight store operating hours are not supported."
    );
  }

  // This implementation supports reservations within one local calendar day
  if (getSriLankaDate(startAt) !== getSriLankaDate(endAt)) {
    throw createError(
      "Reservations must start and end on the same calendar day."
    );
  }

  const startMinutes = getSriLankaMinutes(startAt);
  const endMinutes = getSriLankaMinutes(endAt);

  if (
    startMinutes < openingMinutes ||
    endMinutes > closingMinutes
  ) {
    throw createError(
      `Reservation must be within store operating hours (${openingTime} - ${closingTime}).`
    );
  }
};

// Read the configurable dock count
const getDockCapacity = (store) => {
  const capacity = Number(store.docks);

  if (!Number.isInteger(capacity) || capacity < 1) {
    throw createError(
      "Store dock capacity must be a positive whole number. Please check the Store model."
    );
  }

  return capacity;
};

// Check whether overlapping reservations exceed the available docks
const checkDockAvailability = async ({
  storeId,
  startAt,
  endAt,
  excludeSlotId = null,
  session = null,
}) => {
  const query = {
    store: storeId,
    status: { $in: ["Reserved", "Confirmed", "Rescheduled"] },
    startAt: { $lt: endAt },
    endAt: { $gt: startAt },
  };

  // Exclude the current reservation when updating it
  if (excludeSlotId) {
    query._id = { $ne: excludeSlotId };
  }

  let existingQuery = StoreSlot.find(query).select("startAt endAt").lean();
  if (session) existingQuery = existingQuery.session(session);
  const existingSlots = await existingQuery;

  const events = [
    { time: new Date(startAt).getTime(), change: 1 },
    { time: new Date(endAt).getTime(), change: -1 },
  ];

  existingSlots.forEach((slot) => {
    events.push(
      {
        time: new Date(slot.startAt).getTime(),
        change: 1,
      },
      {
        time: new Date(slot.endAt).getTime(),
        change: -1,
      }
    );
  });

  // At identical timestamps, process departures before arrivals.
  // This allows one reservation to begin exactly when another ends.
  events.sort((a, b) => a.time - b.time || a.change - b.change);

  const dockCapacity = await getStoreDockCapacity(storeId);

  let occupiedDocks = 0;

  for (const event of events) {
    occupiedDocks += event.change;

    if (occupiedDocks > dockCapacity) {
      return {
        available: false,
        dockCapacity,
        message: `All ${dockCapacity} docks are occupied during the requested time.`,
      };
    }
  }

  return {
    available: true,
    dockCapacity,
    message: "Dock availability confirmed.",
  };
};

// Retrieve dock capacity from the store
const getStoreDockCapacity = async (storeId) => {
  const store = await Store.findById(storeId).select("docks");

  if (!store) {
    throw createError("Store not found.", 404);
  }

  return getDockCapacity(store);
};

// Main availability check
const checkSlotAvailability = async ({
  storeId,
  startAt,
  endAt,
  excludeSlotId = null,
  session = null,
}) => {
  const start = new Date(startAt);
  const end = new Date(endAt);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    end <= start
  ) {
    throw createError("Invalid reservation start or end time.");
  }

  let storeQuery = Store.findById(storeId);
  if (session) storeQuery = storeQuery.session(session);
  const store = await storeQuery;

  if (!store) {
    throw createError("Store not found.", 404);
  }

  checkOperatingHours(store, start, end);

  const dockResult = await checkDockAvailability({
    storeId,
    startAt: start,
    endAt: end,
    excludeSlotId,
    session,
  });

  if (!dockResult.available) {
    throw createError(dockResult.message, 409);
  }

  return {
    available: true,
    dockCapacity: dockResult.dockCapacity,
    message: "Reservation time is available.",
  };
};

// Validate a batch of proposed reservations as one schedule. Existing reservations
// being replaced by this batch are excluded, then dock occupancy is simulated
// across the complete set so multiple docks can be used correctly.
const checkSlotScheduleAvailability = async ({ proposedSlots, replacedSlotIds = [], session }) => {
  const groups = new Map();

  for (const proposed of proposedSlots) {
    const storeId = proposed.store.toString();
    const store = await Store.findById(storeId).session(session || null);
    if (!store) throw createError("Store not found.", 404);
    checkOperatingHours(store, proposed.startAt, proposed.endAt);
    if (!groups.has(storeId)) groups.set(storeId, { store, slots: [] });
    groups.get(storeId).slots.push(proposed);
  }

  for (const [storeId, group] of groups) {
    const startAt = new Date(Math.min(...group.slots.map((slot) => slot.startAt.getTime())));
    const endAt = new Date(Math.max(...group.slots.map((slot) => slot.endAt.getTime())));
    const query = {
      store: storeId,
      status: { $in: ["Reserved", "Confirmed", "Rescheduled"] },
      startAt: { $lt: endAt },
      endAt: { $gt: startAt },
    };
    if (replacedSlotIds.length) query._id = { $nin: replacedSlotIds };

    let existingQuery = StoreSlot.find(query).select("startAt endAt").lean();
    if (session) existingQuery = existingQuery.session(session);
    const existingSlots = await existingQuery;
    const events = [];
    for (const slot of existingSlots) {
      events.push(
        { time: new Date(slot.startAt).getTime(), change: 1 },
        { time: new Date(slot.endAt).getTime(), change: -1 }
      );
    }
    for (const slot of group.slots) {
      events.push(
        { time: slot.startAt.getTime(), change: 1 },
        { time: slot.endAt.getTime(), change: -1 }
      );
    }
    events.sort((a, b) => a.time - b.time || a.change - b.change);

    const dockCapacity = getDockCapacity(group.store);
    let occupiedDocks = 0;
    for (const event of events) {
      occupiedDocks += event.change;
      if (occupiedDocks > dockCapacity) {
        throw createError(`All ${dockCapacity} docks are occupied during the proposed schedule.`, 409);
      }
    }
  }

  return { available: true };
};

module.exports = {
  checkSlotAvailability,
  checkSlotScheduleAvailability,
  checkOperatingHours,
  checkDockAvailability,
  lockStoreReservations,
};
