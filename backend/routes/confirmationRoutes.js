const express = require('express');
const router = express.Router();
const { confirmBooking } = require('../controllers/confirmationController');

router.route('/:bookingId').put(confirmBooking);

module.exports = router;