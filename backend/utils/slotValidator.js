const StoreSlot = require('../models/StoreSlot');

const checkSlotAvailability = async ({
  storeId,
  date,
  startTime,
  endTime,
  bay,
  excludeSlotId,
}) => {
  const slotDate = new Date(date);
  if (Number.isNaN(slotDate.getTime())) {
    throw new Error('Invalid slot date.');
  }

  const dayStart = new Date(slotDate);
  dayStart.setHours(0, 0, 0, 0);
  const nextDay = new Date(dayStart);
  nextDay.setDate(nextDay.getDate() + 1);

  const query = {
    store: storeId,
    date: { $gte: dayStart, $lt: nextDay },
    bay,
  };
  if (excludeSlotId) query._id = { $ne: excludeSlotId };

  const existingSlots = await StoreSlot.find(query).select('startTime endTime');
  return existingSlots.every((slot) => startTime >= slot.endTime || endTime <= slot.startTime);
};

module.exports = { checkSlotAvailability };
