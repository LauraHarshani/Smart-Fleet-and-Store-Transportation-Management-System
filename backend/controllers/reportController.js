const Vehicle = require('../models/vehicle');
const Store = require('../models/store');
const Trip = require('../models/trip');
const Booking = require('../models/booking');
const AuditLog = require('../models/AuditLog');

const REPORT_PERIOD_DAYS = 30;
const REPORT_PERIOD_MS = REPORT_PERIOD_DAYS * 24 * 60 * 60 * 1000;

const getVehicleUtilizationData = async () => {
  const now = Date.now();
  const periodStart = now - REPORT_PERIOD_MS;
  const vehicles = await Vehicle.find({}, 'id plate model type status').lean();
  const vehicleIds = vehicles.map((vehicle) => vehicle.id);
  const trips = await Trip.find({
    vehicle: { $in: vehicleIds },
    actualStartAt: { $lt: new Date(now) },
    $or: [{ actualEndAt: { $gt: new Date(periodStart) } }, { actualEndAt: null }],
    status: { $nin: ['Cancelled', 'Draft', 'Pending'] },
  }).select('vehicle actualStartAt actualEndAt').lean();

  return vehicles.map((vehicle) => {
    const intervals = trips
      .filter((trip) => trip.vehicle === vehicle.id && trip.actualStartAt)
      .map((trip) => [
        Math.max(new Date(trip.actualStartAt).getTime(), periodStart),
        Math.min(trip.actualEndAt ? new Date(trip.actualEndAt).getTime() : now, now),
      ])
      .filter(([start, end]) => end > start)
      .sort((a, b) => a[0] - b[0]);

    let usedMs = 0;
    let current = null;
    for (const [start, end] of intervals) {
      if (!current) current = [start, end];
      else if (start <= current[1]) current[1] = Math.max(current[1], end);
      else {
        usedMs += current[1] - current[0];
        current = [start, end];
      }
    }
    if (current) usedMs += current[1] - current[0];

    return {
      vehicleId: vehicle.id,
      registrationNumber: vehicle.plate,
      type: vehicle.type,
      status: vehicle.status,
      utilizationPercentage: Number(Math.min((usedMs / REPORT_PERIOD_MS) * 100, 100).toFixed(1)),
    };
  });
};

const getReportSummary = async (req, res) => {
  try {
    const periodStart = new Date(Date.now() - REPORT_PERIOD_MS);
    const [totalVehicles, totalStores, bookings, trips, completedTrips, delayedTrips, totalAuditLogs, exceptionLogs, utilization] = await Promise.all([
      Vehicle.countDocuments(),
      Store.countDocuments(),
      Booking.countDocuments(),
      Trip.countDocuments(),
      Trip.countDocuments({ date: { $gte: periodStart }, status: 'Completed' }),
      Trip.countDocuments({ date: { $gte: periodStart }, status: 'Delayed' }),
      AuditLog.countDocuments(),
      AuditLog.countDocuments({ action: /exception|deviation|alert/i }),
      getVehicleUtilizationData(),
    ]);
    const slaTrips = completedTrips + delayedTrips;
    const averageUtilization = utilization.length
      ? utilization.reduce((sum, vehicle) => sum + vehicle.utilizationPercentage, 0) / utilization.length
      : 0;

    return res.status(200).json({
      success: true,
      data: {
        totalOperations: bookings + trips,
        onTimeSLA: `${(slaTrips ? (completedTrips / slaTrips) * 100 : 0).toFixed(1)}%`,
        fleetUtilization: `${averageUtilization.toFixed(1)}%`,
        auditExceptionRate: `${(totalAuditLogs ? (exceptionLogs / totalAuditLogs) * 100 : 0).toFixed(1)}%`,
        totalVehicles,
        totalStores,
      },
    });
  } catch (error) {
    console.error('Report summary error:', error);
    return res.status(500).json({ success: false, message: 'Unable to load report summary' });
  }
};

const getVehicleUtilization = async (req, res) => {
  try {
    const data = await getVehicleUtilizationData();
    return res.status(200).json({
      success: true,
      period: { start: new Date(Date.now() - REPORT_PERIOD_MS), end: new Date(), durationDays: REPORT_PERIOD_DAYS },
      data,
    });
  } catch (error) {
    console.error('Vehicle utilization report error:', error);
    return res.status(500).json({ success: false, message: 'Unable to load vehicle utilization report' });
  }
};

const getBookingReports = async (req, res) => {
  try {
    const [totalBookings, completed, cancelled, rejected, delayed, pending] = await Promise.all([
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'Completed' }),
      Booking.countDocuments({ status: 'Cancelled' }),
      Booking.countDocuments({ status: 'Rejected' }),
      Trip.countDocuments({ status: 'Delayed' }),
      Booking.countDocuments({ status: 'Pending' }),
    ]);
    return res.status(200).json({ success: true, data: { totalBookings, completed, cancelled, rejected, delayed, pending } });
  } catch (error) {
    console.error('Booking report error:', error);
    return res.status(500).json({ success: false, message: 'Unable to load booking report' });
  }
};

module.exports = { getReportSummary, getVehicleUtilization, getBookingReports };
