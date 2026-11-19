const Vehicle = require('../models/Vehicle');
const Store = require('../models/Store');

// @desc    Get dashboard summary (Booking summary, utilization)
// @route   GET /api/reports/summary
const getReportSummary = async (req, res) => {
  try {
    
    const totalVehicles = await Vehicle.countDocuments();
    const totalStores = await Store.countDocuments();
    
    
    res.status(200).json({
      success: true,
      data: {
        totalOperations: 1482,
        onTimeSLA: "96.8%",
        fleetUtilization: "88.4%",
        auditExceptionRate: "1.2%",
        totalVehicles,
        totalStores
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get vehicle utilization report
// @route   GET /api/reports/vehicle-utilization
const getVehicleUtilization = async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    
    // Mock utilization data based on vehicles
    const utilizationData = vehicles.map(v => ({
      vehicleId: v._id,
      registrationNumber: v.registrationNumber,
      type: v.type,
      status: v.status,
      utilizationPercentage: Math.floor(Math.random() * (95 - 60 + 1) + 60) // Random 60-95%
    }));

    res.status(200).json({ success: true, data: utilizationData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Booking & Delay Reports
// @route   GET /api/reports/bookings
const getBookingReports = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        totalBookings: 156,
        completed: 120,
        cancelled: 15,
        rejected: 5,
        delayed: 16,
        storeWaitingTimeAvgMins: 42,
        quantityMovementTotalKg: 45200
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getReportSummary, getVehicleUtilization, getBookingReports };