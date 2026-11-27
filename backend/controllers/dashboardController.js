const Vehicle = require("../models/vehicle");
const Booking = require("../models/booking");
const { StoreBooking } = require("../models/StoreBooking");
const Trip = require("../models/trip");

// Sri Lanka timezone: UTC +05:30
const TIME_ZONE_OFFSET = 5.5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

// Get the current date in Sri Lanka
const getColomboDate = () => {
    return new Date(Date.now() + TIME_ZONE_OFFSET);
};

// Convert a Sri Lankan local date/time to UTC
const colomboDateToUTC = (date) => {
    return new Date(date.getTime() - TIME_ZONE_OFFSET);
};

// Get the start of today in Sri Lanka
const getTodayRange = () => {
    const now = getColomboDate();

    const start = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate()
    ));

    const end = new Date(start.getTime() + DAY_MS);

    return {
        start: colomboDateToUTC(start),
        end: colomboDateToUTC(end)
    };
};

// --------------------------------------------------
// 1. DASHBOARD KPI CARDS
// --------------------------------------------------

const getDashboardKPIs = async (req, res) => {
    try {
        const { start, end } = getTodayRange();

        const [
            activeVehicles,
            todayTrips,
            pendingBookings,
            delayedTrips,
            completedTrips
        ] = await Promise.all([
            Vehicle.countDocuments({ status: "Active" }),

            Trip.countDocuments({
                date: { $gte: start, $lt: end }
            }),

            Booking.countDocuments({
                status: "Pending"
            }),

            Trip.countDocuments({
                date: { $gte: start, $lt: end },
                status: "Delayed"
            }),

            Trip.countDocuments({
                date: { $gte: start, $lt: end },
                status: "Completed"
            })
        ]);

        res.status(200).json({
            success: true,
            data: {
                activeVehicles,
                todayTrips,
                pendingBookings,
                delayedTrips,
                completedTrips
            }
        });

    } catch (error) {
        console.error("Dashboard KPI Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve dashboard statistics"
        });
    }
};

// --------------------------------------------------
// 2. TRIP STATUS DONUT CHART
// --------------------------------------------------

const getTripStatus = async (req, res) => {
    try {
        const { start, end } = getTodayRange();
        const tripStatuses = await Trip.aggregate([
            { $match: { date: { $gte: start, $lt: end } } },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    status: "$_id",
                    count: 1
                }
            },
            {
                $sort: { status: 1 }
            }
        ]);

        res.status(200).json({
            success: true,
            data: tripStatuses
        });

    } catch (error) {
        console.error("Trip Status Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve trip status statistics"
        });
    }
};

// --------------------------------------------------
// 3. FLEET STATUS CHART
// --------------------------------------------------

const getFleetStatus = async (req, res) => {
    try {
        const fleetStatuses = await Vehicle.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    status: "$_id",
                    count: 1
                }
            },
            {
                $sort: { status: 1 }
            }
        ]);

        res.status(200).json({
            success: true,
            data: fleetStatuses
        });

    } catch (error) {
        console.error("Fleet Status Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve fleet status statistics"
        });
    }
};

// --------------------------------------------------
// 4. VEHICLE UTILIZATION - LAST 4 WEEKS
// --------------------------------------------------

const getVehicleUtilization = async (req, res) => {
    try {
        const now = Date.now();

        // Four completed 7-day periods, ending at the current time.
        const periodStart = now - (4 * WEEK_MS);

        const vehicles = await Vehicle.find(
            {},
            { id: 1, plate: 1, model: 1 }
        ).lean();

        const trips = await Trip.find({
            vehicle: { $ne: null },
            actualStartAt: { $lt: new Date(now) },
            $or: [
                { actualEndAt: { $gt: new Date(periodStart) } },
                { actualEndAt: null }
            ],
            status: { $nin: ["Cancelled", "Draft", "Pending"] }
        }).select("vehicle actualStartAt actualEndAt").lean();

        const weeks = Array.from({ length: 4 }, (_, index) => ({
            week: `Week ${index + 1}`,
            start: new Date(periodStart + index * WEEK_MS),
            end: new Date(periodStart + (index + 1) * WEEK_MS)
        }));

        const results = vehicles.map(vehicle => {
            const vehicleTrips = trips.filter(
                trip => trip.vehicle === vehicle.id
            );

            const weeklyData = weeks.map(week => {
                const intervals = [];

                vehicleTrips.forEach(trip => {
                    if (!trip.actualStartAt) return;

                    const tripStart = new Date(trip.actualStartAt).getTime();
                    const tripEnd = trip.actualEndAt
                        ? new Date(trip.actualEndAt).getTime()
                        : now;

                    const overlapStart = Math.max(
                        tripStart,
                        week.start.getTime()
                    );

                    const overlapEnd = Math.min(
                        tripEnd,
                        week.end.getTime(),
                        now
                    );

                    if (overlapEnd > overlapStart) {
                        intervals.push([overlapStart, overlapEnd]);
                    }
                });

                // Merge overlapping intervals to avoid double counting.
                intervals.sort((a, b) => a[0] - b[0]);

                let usedMilliseconds = 0;
                let currentStart = null;
                let currentEnd = null;

                intervals.forEach(([start, end]) => {
                    if (currentStart === null) {
                        currentStart = start;
                        currentEnd = end;
                    } else if (start <= currentEnd) {
                        currentEnd = Math.max(currentEnd, end);
                    } else {
                        usedMilliseconds += currentEnd - currentStart;
                        currentStart = start;
                        currentEnd = end;
                    }
                });

                if (currentStart !== null) {
                    usedMilliseconds += currentEnd - currentStart;
                }

                // Available time is the elapsed time in each week.
                const availableMilliseconds = Math.max(
                    0,
                    Math.min(week.end.getTime(), now) -
                    week.start.getTime()
                );

                const utilization = availableMilliseconds > 0
                    ? (usedMilliseconds / availableMilliseconds) * 100
                    : 0;

                return {
                    week: week.week,
                    utilization: Number(
                        Math.min(utilization, 100).toFixed(2)
                    )
                };
            });

            return {
                vehicleId: vehicle.id,
                plate: vehicle.plate,
                model: vehicle.model,
                weeklyUtilization: weeklyData
            };
        });

        res.status(200).json({
            success: true,
            period: {
                start: new Date(periodStart),
                end: new Date(now),
                durationDays: 28
            },
            data: results
        });

    } catch (error) {
        console.error("Vehicle Utilization Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to calculate vehicle utilization"
        });
    }
};

// --------------------------------------------------
// 5. MONTHLY TRIP SUMMARY - LAST 6 MONTHS
// --------------------------------------------------

const getMonthlyTripSummary = async (req, res) => {
    try {
        const now = getColomboDate();

        const firstMonth = new Date(Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth() - 5,
            1
        ));

        const summary = await Trip.aggregate([
            {
                $match: {
                    date: {
                        $gte: colomboDateToUTC(firstMonth),
                        $lt: colomboDateToUTC(
                            new Date(Date.UTC(
                                now.getUTCFullYear(),
                                now.getUTCMonth() + 1,
                                1
                            ))
                        )
                    }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$date" },
                        month: { $month: "$date" }
                    },
                    totalTrips: { $sum: 1 },
                    completedTrips: {
                        $sum: {
                            $cond: [
                                { $eq: ["$status", "Completed"] },
                                1,
                                0
                            ]
                        }
                    },
                    delayedTrips: {
                        $sum: {
                            $cond: [
                                { $eq: ["$status", "Delayed"] },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                $sort: {
                    "_id.year": 1,
                    "_id.month": 1
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: summary.map(item => ({
                year: item._id.year,
                month: item._id.month,
                totalTrips: item.totalTrips,
                completedTrips: item.completedTrips,
                delayedTrips: item.delayedTrips
            }))
        });

    } catch (error) {
        console.error("Monthly Trip Summary Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve monthly trip summary"
        });
    }
};

// --------------------------------------------------
// 6. UPCOMING TRIPS TABLE
// --------------------------------------------------

const getUpcomingTrips = async (req, res) => {
    try {
        const { start, end } = getTodayRange();
        const localNow = getColomboDate();
        const currentTime = `${String(localNow.getUTCHours()).padStart(2, '0')}:${String(localNow.getUTCMinutes()).padStart(2, '0')}`;
        const now = new Date();

        const trips = await Trip.find({
            status: { $nin: ["Cancelled", "Completed"] },
            $or: [
                { scheduledStartAt: { $gte: now } },
                { status: { $in: ["In Progress", "Delayed"] } },
                {
                    scheduledStartAt: null,
                    $or: [
                        { date: { $gte: end } },
                        { date: { $gte: start, $lt: end }, start: { $gte: currentTime } }
                    ]
                }
            ]
        })
            .sort({ scheduledStartAt: 1, date: 1, start: 1 })
            .limit(10)
            .select(
                "id route origin destination date start end vehicle driver status scheduledStartAt"
            )
            .lean();

        res.status(200).json({
            success: true,
            data: trips
        });

    } catch (error) {
        console.error("Upcoming Trips Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve upcoming trips"
        });
    }
};

// --------------------------------------------------
// 7. RECENT BOOKINGS TABLE
// --------------------------------------------------

const getRecentBookings = async (req, res) => {
    try {
        const bookings = await StoreBooking.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .select(
                "bookingCode pickupStore destinationStore requestedPickupDate status items createdAt"
            )
            .populate("pickupStore", "name")
            .populate("destinationStore", "name")
            .lean();

        res.status(200).json({
            success: true,
            data: bookings.map((booking) => ({
                id: booking.bookingCode || booking._id.toString(),
                store: `${booking.pickupStore?.name || "—"} → ${booking.destinationStore?.name || "—"}`,
                totalItems: booking.items?.length || 0,
                date: booking.requestedPickupDate,
                status: booking.status,
                createdAt: booking.createdAt
            }))
        });

    } catch (error) {
        console.error("Recent Bookings Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve recent bookings"
        });
    }
};

module.exports = {
    getDashboardKPIs,
    getTripStatus,
    getFleetStatus,
    getVehicleUtilization,
    getMonthlyTripSummary,
    getUpcomingTrips,
    getRecentBookings
};
