const StoreSlot = require('../models/StoreSlot');
const Booking = require('../models/booking');


const getStoreSchedule = async (req, res) => {
  try {
    const { storeId, startDate, endDate } = req.query;

    
    const query = { store: storeId };
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    
    const slots = await StoreSlot.find(query)
      .populate({
        path: 'booking',
        select: 'bookingId type status vehicle',
        populate: { path: 'vehicle', select: 'registrationNumber type' }
      })
      .sort({ date: 1, startTime: 1 });

    res.status(200).json({ success: true, count: slots.length, data: slots });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getStoreSchedule };