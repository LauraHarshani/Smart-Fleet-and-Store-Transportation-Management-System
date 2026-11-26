const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const connectDB = require("./config/db");

// Import the management routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const storeRoutes = require("./routes/storeRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const itemRoutes = require("./routes/itemRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const auditRoutes = require("./routes/auditRoutes");   // BE-10
const reportRoutes = require("./routes/reportRoutes"); // BE-11

// Admin paths
const dashboardRoutes = require("./routes/dashboardRoutes");

// Store Operations Routes (BE-8 & BE-9)
const scheduleRoutes = require("./routes/scheduleRoutes");
const confirmationRoutes = require("./routes/confirmationRoutes");
const storeSlotRoutes = require("./routes/StoreSlotRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);

// Admin
app.use("/api/admin/dashboard", dashboardRoutes);

// Mount the routes to their respective base paths
app.use("/api/users", userRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/audit-logs", auditRoutes); // BE-10
app.use("/api/reports", reportRoutes);   // BE-11

// Store Operations Routes
app.use("/api/schedules", scheduleRoutes);       // BE-8
app.use("/api/confirmations", confirmationRoutes); // BE-9
app.use("/api/store-slots", storeSlotRoutes);

app.get("/", (req, res) => res.send("Smart Fleet API is running..."));

// Only accept traffic after MongoDB is ready.
connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port: ${PORT}`);
        });
    })
    .catch((error) => {
        console.error(`Unable to start server: ${error.message}`);
        process.exit(1);
    });
