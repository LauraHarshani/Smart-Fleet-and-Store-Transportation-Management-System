
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

  if (!result.matchedCount) {
    throw createError("Store not found.", 404);
  }
};

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

const getSriLankaDate = (date) => {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Colombo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
};

const timeToMinutes = (time) => {
  if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(time || "")) {
    throw createError(`Invalid store operating time: ${time}`);
  }

  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

// Supports both operatingHours: { open, close }
// and legacy hours: "08:00 AM - 06:00 PM (Mon - Sat)".
const parseOperatingHours = (store) => {
  const structuredOpen = store.operatingHours?.open;
  const structuredClose = store.operatingHours?.close;

  if (structuredOpen && structuredClose) {
    return {
      open: structuredOpen,
      close: structuredClose,
    };
  }

  const displayHours = String(store.hours || "");

  const match = displayHours.match(
    /(\d{1,2}:\d{2}\s*(?:AM|PM))\s*-\s*(\d{1,2}:\d{2}\s*(?:AM|PM))/i
  );

  if (!match) {
    throw createError("Store operating hours are not configured.");
  }

  const to24Hour = (value) => {
    const parsed = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);

    if (!parsed) {
      throw createError(`Invalid store operating time: ${value}`);
    }

    let hour = Number(parsed[1]);
    const minute = Number(parsed[2]);
    const period = parsed[3].toUpperCase();

    if (hour < 1 || hour > 12 || minute > 59) {
      throw createError(`Invalid store operating time: ${value}`);
    }

    if (period === "AM" && hour === 12) hour = 0;
    if (period === "PM" && hour !== 12) hour += 12;

    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  };

  return {
    open: to24Hour(match[1].replace(/\s+/g, " ").trim()),
    close: to24Hour(match[2].replace(/\s+/g, " ").trim()),
  };
};

const checkOperatingHours = (store, startAt, endAt) => {
  const { open, close } = parseOperatingHours(store);

  const openingMinutes = timeToMinutes(open);
  const closingMinutes = timeToMinutes(close);

  if (closingMinutes <= openingMinutes) {
    throw createError("Overnight store operating hours are not supported.");
  }

  if (getSriLankaDate(startAt) !== getSriLankaDate(endAt)) {
    throw createError(
      "Reservations must start and end on the same calendar day."
    );
  }

  const startMinutes = getSriLankaMinutes(startAt);
  const endMinutes = getSriLankaMinutes(endAt);

  if (startMinutes < openingMinutes || endMinutes > closingMinutes) {
    throw createError(
      `Reservation must be within store operating hours (${open} - ${close}).`
    );
  }
};

const getDockCapacity = (store) => {
  const capacity = Number(store.docks);

  if (!Number.isInteger(capacity) || capacity < 1) {
    throw createError(
      "Store dock capacity must be a positive whole number. Please check the Store model."
    );
  }

  return capacity;
};

const getStoreDockCapacity = async (storeId, session = null) => {
  let query = Store.findById(storeId).select("docks");

  if (session) {
    query = query.session(session);
  }

  const store = await query;

  if (!store) {
    throw createError("Store not found.", 404);
  }

  return getDockCapacity(store);
};

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

  if (excludeSlotId) {
    query._id = { $ne: excludeSlotId };
  }

  let existingQuery = StoreSlot.find(query)
    .select("startAt endAt")
    .lean();

  if (session) {
    existingQuery = existingQuery.session(session);
  }

  const existingSlots = await existingQuery;

  const events = [
    { time: new Date(startAt).getTime(), change: 1 },
    { time: new Date(endAt).getTime(), change: -1 },
  ];

  existingSlots.forEach((slot) => {
    events.push(
      { time: new Date(slot.startAt).getTime(), change: 1 },
      { time: new Date(slot.endAt).getTime(), change: -1 }
    );
  });

  events.sort((a, b) => a.time - b.time || a.change - b.change);

  const dockCapacity = await getStoreDockCapacity(storeId, session);
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

  if (session) {
    storeQuery = storeQuery.session(session);
  }

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

const checkSlotScheduleAvailability = async ({
  proposedSlots,
  replacedSlotIds = [],
  session = null,
}) => {
  const groups = new Map();

  for (const proposed of proposedSlots) {
    const startAt = new Date(proposed.startAt);
    const endAt = new Date(proposed.endAt);

    if (
      Number.isNaN(startAt.getTime()) ||
      Number.isNaN(endAt.getTime()) ||
      endAt <= startAt
    ) {
      throw createError("Invalid reservation start or end time.");
    }

    const storeId = proposed.store.toString();

    let storeQuery = Store.findById(storeId);

    if (session) {
      storeQuery = storeQuery.session(session);
    }

    const store = await storeQuery;

    if (!store) {
      throw createError("Store not found.", 404);
    }

    checkOperatingHours(store, startAt, endAt);

    if (!groups.has(storeId)) {
      groups.set(storeId, { store, slots: [] });
    }

    groups.get(storeId).slots.push({ startAt, endAt });
  }

  for (const [storeId, group] of groups) {
    const earliestStart = Math.min(
      ...group.slots.map((slot) => slot.startAt.getTime())
    );

    const latestEnd = Math.max(
      ...group.slots.map((slot) => slot.endAt.getTime())
    );

    const query = {
      store: storeId,
      status: { $in: ["Reserved", "Confirmed", "Rescheduled"] },
      startAt: { $lt: new Date(latestEnd) },
      endAt: { $gt: new Date(earliestStart) },
    };

    if (replacedSlotIds.length) {
      query._id = { $nin: replacedSlotIds };
    }

    let existingQuery = StoreSlot.find(query)
      .select("startAt endAt")
      .lean();

    if (session) {
      existingQuery = existingQuery.session(session);
    }

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
        throw createError(
          `All ${dockCapacity} docks are occupied during the proposed schedule.`,
          409
        );
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
