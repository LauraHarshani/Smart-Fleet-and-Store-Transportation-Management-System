const StoreSlot = require('../models/StoreSlot');

const checkSlotAvailability = async (storeId, date, startTime, endTime, bay) => {
  
  const existingSlots = await StoreSlot.find({
    store: storeId,
    date: new Date(date),
    bay: bay,
    status: 'Booked'
  });

  
  const isOverlapping = existingSlots.some(slot => {
    return (startTime < slot.endTime && endTime > slot.startTime);
  });

  return !isOverlapping; 
};

module.exports = { checkSlotAvailability };