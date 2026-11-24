const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
    createBooking,
    cancelBooking
} = require('../controllers/bookingController');

const router = express.Router();

router.post('/', protect, createBooking);
router.patch("/:id/cancel", protect, cancelBooking);

module.exports = router;
