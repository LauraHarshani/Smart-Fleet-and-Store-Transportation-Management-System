const slotService = require('../services/slotService');

const sendError = (res, error, fallbackMessage) => {
  console.error(fallbackMessage, error);
  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || fallbackMessage,
  });
};

const createSlot = async (req, res) => {
  try {
    const slot = await slotService.createSlot(req.body, req.storeScope);
    return res.status(201).json({
      success: true,
      message: 'Store slot reservation created successfully.',
      data: slot,
    });
  } catch (error) {
    return sendError(res, error, 'Failed to create slot reservation.');
  }
};

const getSlots = async (req, res) => {
  try {
    const slots = await slotService.getSlots(req.query, req.storeScope);
    return res.status(200).json({
      success: true,
      count: slots.length,
      data: slots,
    });
  } catch (error) {
    return sendError(res, error, 'Failed to retrieve slot reservations.');
  }
};

const getSlotById = async (req, res) => {
  try {
    const slot = await slotService.getSlotById(req.params.id, req.storeScope);
    return res.status(200).json({ success: true, data: slot });
  } catch (error) {
    return sendError(res, error, 'Failed to retrieve slot reservation.');
  }
};

const updateSlot = async (req, res) => {
  try {
    const slot = await slotService.updateSlot(req.params.id, req.body, req.storeScope);
    return res.status(200).json({
      success: true,
      message: 'Slot reservation updated successfully.',
      data: slot,
    });
  } catch (error) {
    return sendError(res, error, 'Failed to update slot reservation.');
  }
};

const cancelSlot = async (req, res) => {
  try {
    const slot = await slotService.cancelSlot(req.params.id, req.storeScope);
    return res.status(200).json({
      success: true,
      message: 'Slot reservation cancelled successfully.',
      data: slot,
    });
  } catch (error) {
    return sendError(res, error, 'Failed to cancel slot reservation.');
  }
};

module.exports = {
  createSlot,
  getSlots,
  getSlotById,
  updateSlot,
  cancelSlot,
};
