const mongoose = require('mongoose');
const StoreSlot = require('../models/StoreSlot');

const parseDate = (value, label) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    const error = new Error(`Invalid ${label}.`);
    error.statusCode = 400;
    throw error;
  }
  return date;
};

const getStoreSchedule = async (req, res) => {
  try {
    const storeId = req.storeScope || req.query.storeId;
    if (!storeId || !mongoose.Types.ObjectId.isValid(storeId)) {
      return res.status(400).json({
        success: false,
        message: 'A valid store ID is required to load the schedule.',
      });
    }

    const query = { store: storeId };
    const startDate = parseDate(req.query.startDate, 'start date');
    const endDate = parseDate(req.query.endDate, 'end date');
    if (startDate && endDate && endDate < startDate) {
      return res.status(400).json({ success: false, message: 'End date must be after start date.' });
    }
    if (startDate || endDate) {
      query.startAt = {};
      if (startDate) query.startAt.$gte = startDate;
      if (endDate) query.startAt.$lte = endDate;
    }

    const slots = await StoreSlot.find(query)
      .populate('store', 'name code')
      .populate('trip', 'id route status vehicle driver')
      .sort({ startAt: 1 });

    return res.status(200).json({ success: true, count: slots.length, data: slots });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Unable to load the store schedule.',
    });
  }
};

module.exports = { getStoreSchedule };
