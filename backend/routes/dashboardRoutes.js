const express = require("express");
const router = express.Router();

const {
    getDashboardKPIs,
    getTripStatus,
    getFleetStatus,
    getVehicleUtilization,
    getMonthlyTripSummary,
    getUpcomingTrips,
    getRecentBookings
} = require("../controllers/dashboardController");

const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

//dashboard endpoints require Admin authentication.
router.use(protect);
router.use(allowRoles("ADMIN"));

router.get("/kpis", getDashboardKPIs);
router.get("/trip-status", getTripStatus);
router.get("/fleet-status", getFleetStatus);
router.get("/vehicle-utilization", getVehicleUtilization);
router.get("/monthly-trips", getMonthlyTripSummary);
router.get("/upcoming-trips", getUpcomingTrips);
router.get("/recent-bookings", getRecentBookings);

module.exports = router;
