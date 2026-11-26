const mongoose = require("mongoose");
const slotService = require("../services/slotService");
const { getAvailableDockNumbers } = require("../services/conflictDetectionService");

const getAvailableDocks = async (req, res) => {
  try {
    const { store: storeId, startAt, endAt } = req.query;
    if (!mongoose.Types.ObjectId.isValid(storeId)) {
      return res.status(400).json({ success: false, message: "A valid store ID is required." });
    }
    if (req.storeScope && req.storeScope.toString() !== storeId.toString()) {
      return res.status(403).json({ success: false, message: "Access denied. You cannot access another store's data." });
    }
    const result = await getAvailableDockNumbers({ storeId, startAt, endAt });
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res.status(error.statusCode || 400).json({ success: false, message: error.message || "Unable to check dock availability." });
  }
};

// CREATE SLOT RESERVATION
const createSlot = async (req, res) => {
  try {
    const slot = await slotService.createSlot(req.body, req.storeScope);

    return res.status(201).json({
      success: true,
      message: "Store slot reservation created successfully.",
      data: slot,
    });
  } catch (error) {
    console.error("Create slot error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to create slot reservation.",
    });
  }
};

// GET ALL SLOT RESERVATIONS
const getSlots = async (req, res) => {
  try {
    const filters = { ...req.query };
    if (req.storeScope) filters.store = req.storeScope;
    const slots = await slotService.getSlots(filters);

    return res.status(200).json({
      success: true,
      count: slots.length,
      data: slots,
    });
  } catch (error) {
    console.error("Get slots error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to retrieve slot reservations.",
    });
  }
};

// GET ONE SLOT RESERVATION
const getSlotById = async (req, res) => {
  try {
    const slot = await slotService.getSlotById(req.params.id, req.storeScope);

    return res.status(200).json({
      success: true,
      data: slot,
    });
  } catch (error) {
    console.error("Get slot details error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to retrieve slot reservation.",
    });
  }
};

// UPDATE SLOT RESERVATION
const updateSlot = async (req, res) => {
  try {
    const slot = await slotService.updateSlot(
      req.params.id,
      req.body,
      req.storeScope
    );

    return res.status(200).json({
      success: true,
      message: "Slot reservation updated successfully.",
      data: slot,
    });
  } catch (error) {
    console.error("Update slot error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update slot reservation.",
    });
  }
};

// CANCEL SLOT RESERVATION
const cancelSlot = async (req, res) => {
  try {
    const slot = await slotService.cancelSlot(req.params.id, req.storeScope);

    return res.status(200).json({
      success: true,
      message: "Slot reservation cancelled successfully.",
      data: slot,
    });
  } catch (error) {
    console.error("Cancel slot error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to cancel slot reservation.",
    });
  }
};

module.exports = {
  createSlot,
  getAvailableDocks,
  getSlots,
  getSlotById,
  updateSlot,
  cancelSlot,
};
