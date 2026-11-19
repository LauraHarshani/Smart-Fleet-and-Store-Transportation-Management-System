const express = require('express');
const router = express.Router();
const { getReportSummary, getVehicleUtilization, getBookingReports } = require('../controllers/reportController');

router.get('/summary', getReportSummary);
router.get('/vehicle-utilization', getVehicleUtilization);
router.get('/bookings', getBookingReports);

module.exports = router;