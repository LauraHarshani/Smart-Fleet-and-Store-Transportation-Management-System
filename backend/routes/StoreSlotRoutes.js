
const express = require("express");
const router = express.Router();

const {
  createSlot,
  getAvailableDocks,
  getSlots,
  getSlotById,
  updateSlot,
  cancelSlot,
} = require("../controllers/StoreSlotController");

const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const { storeScope } = require("../middleware/storeScopeMiddleware");

router.use(protect);

router.use(
  allowRoles("ADMIN", "STORE MANAGER", "STORE EMPLOYEE")
);

router.use(storeScope);

// Create a reservation
router.post("/", createSlot);

// Check which numbered docks are free for a store and time window
router.get("/availability/docks", getAvailableDocks);

// Retrieve reservations
router.get("/", getSlots);

// Retrieve one reservation
router.get("/:id", getSlotById);

// Update a reservation
router.patch("/:id", updateSlot);

// Cancel a reservation
router.patch("/:id/cancel", cancelSlot);

module.exports = router;
