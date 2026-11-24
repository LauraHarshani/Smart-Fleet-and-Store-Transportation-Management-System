const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');
const { getReportSummary, getVehicleUtilization, getBookingReports } = require('../controllers/reportController');

router.use(protect, allowRoles('ADMIN'));

router.get('/summary', getReportSummary);
router.get('/vehicle-utilization', getVehicleUtilization);
router.get('/bookings', getBookingReports);

module.exports = router;
