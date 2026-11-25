const express = require("express");
const router = express.Router();

const {
  createSlot,
  getSlots,
  getSlotById,
  updateSlot,
  cancelSlot,
} = require("../controllers/StoreSlotController");

const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

router.use(protect);

router.use(allowRoles("ADMIN", "STORE_MANAGER", "STORE_EMPLOYEE"));

// Create a reservation
router.post("/", createSlot);

// Retrieve reservations
router.get("/", getSlots);

// Retrieve one reservation
router.get("/:id", getSlotById);

// Update a reservation
router.patch("/:id", updateSlot);

// Cancel a reservation
router.patch("/:id/cancel", cancelSlot);

module.exports = router;
