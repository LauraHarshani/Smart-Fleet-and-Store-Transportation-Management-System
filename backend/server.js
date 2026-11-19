const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const connectDB =require("./config/db");

const authRoutes = require("./routes/authRoutes")
//Admin paths
const dashboardRoutes = require("./routes/dashboardRoutes")

const app = express();

//Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());


//Routes
app.use("/api/auth", authRoutes)
//Admin
app.use("/api/admin/dashboard", dashboardRoutes);

const PORT = process.env.PORT || 5000;

//db connect
connectDB();

app.listen(PORT, ()=>{
    console.log(`Server is running on port: ${PORT}`);
})