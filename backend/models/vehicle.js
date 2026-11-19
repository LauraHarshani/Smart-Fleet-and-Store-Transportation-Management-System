const mongoose = require('mongoose');

// Define the schema for Vehicle Management based on SRS and Frontend requirements
const vehicleSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // e.g., VH-401
    plate: { type: String, required: true }, // Registration Plate (e.g., WP-CAB-8492)
    vin: { type: String, required: true }, // Chassis / VIN Number
    model: { type: String, required: true }, // Make & Model (e.g., Isuzu Forward)
    type: { type: String, required: true }, // Body Type (e.g., Refrigerated Box, Dry Freight Van)
    payload: { type: String, required: true }, // Maximum Net Payload in Tons
    volume: { type: String, required: true }, // Cargo Volume Capacity
    store: { type: String, required: true }, // Assigned Store / Hub
    odometer: { type: String, required: true }, // Initial Odometer Reading
    driver: { type: String, default: 'Unallocated' }, // Assigned Driver
    status: { type: String, default: 'Standby' }, // e.g., Active, Maintenance, Standby
    image: { type: String, default: null } // Vehicle Image URL or Base64 string
}, {
    timestamps: true // Automatically adds createdAt and updatedAt
});

module.exports = mongoose.model('Vehicle', vehicleSchema);