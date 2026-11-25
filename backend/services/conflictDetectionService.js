const Store = require("../models/store");
const StoreSlot = require("../models/StoreSlot");

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
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

  const existingSlots = await StoreSlot.find(query)
    .select("startAt endAt")
    .lean();

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

  const store = await Store.findById(storeId);

  if (!store) {
    throw createError("Store not found.", 404);
  }

  checkOperatingHours(store, start, end);

  const dockResult = await checkDockAvailability({
    storeId,
    startAt: start,
    endAt: end,
    excludeSlotId,
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

module.exports = {
  checkSlotAvailability,
  checkOperatingHours,
  checkDockAvailability,
};
