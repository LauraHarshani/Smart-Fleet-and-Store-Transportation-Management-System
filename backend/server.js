const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

// Import the management routes
const userRoutes = require("./routes/userRoutes");
const storeRoutes = require("./routes/storeRoutes"); 
const vehicleRoutes = require("./routes/vehicleRoutes");
const itemRoutes = require("./routes/itemRoutes"); 

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mount the routes to their respective base paths
app.use("/api/users", userRoutes);
app.use("/api/stores", storeRoutes); 
app.use("/api/vehicles", vehicleRoutes); 
app.use("/api/items", itemRoutes);

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});