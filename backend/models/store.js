const mongoose = require('mongoose');

// Define the schema for Store Management based on SRS and Frontend requirements
const storeSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // e.g., ST-CMB-01
    name: { type: String, required: true },
    region: { type: String, required: true }, // e.g., Western Province
    subRegion: { type: String, default: '' },
    address: { type: String, required: true },
    coordinates: { type: String, required: true }, // GPS Coordinates
    phone: { type: String, required: true },
    hours: { type: String, required: true }, // Operating Hours
    rules: { type: String, required: true }, // Loading Slot Rules (e.g., Max 2 trucks per hour)
    capacity: { type: String, required: true }, // e.g., 24,000 MT
    docks: { type: String, default: '4 Active Docks' },
    utilization: { type: Number, default: 0 }, // e.g., 69 (%)
    status: { type: String, default: 'Active' }, // Active, Operational
    operationalClass: { type: String, default: 'Standard Transit Depot' },
    operationalDetails: { type: String, default: 'Standard storage operations.' }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt
});

module.exports = mongoose.model('Store', storeSchema);