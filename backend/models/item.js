const mongoose = require('mongoose');

// Define the schema for Item Management based on SRS and Frontend requirements
const itemSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // Item Code / SKU (e.g., ITM-1001)
    name: { type: String, required: true }, // Item Name
    description: { type: String, required: true }, // Item Description
    category: { type: String, required: true }, // Freight Category (e.g., Cold-Chain Perishables)
    uom: { type: String, required: true }, // Unit of Measure (e.g., Cartons / Cases)
    weight: { type: String, required: true }, // Gross Weight per Unit
    status: { type: String, default: 'Active' }, // Active, Under Review, Restricted
    statusColor: { type: String, default: 'bg-[#d1f4e0]/60 text-[#0d9468]' },
    categoryColor: { type: String, default: 'bg-gray-100 text-gray-700 border-gray-200' },
    image: { type: String, default: null } // Image URL or Base64
}, {
    timestamps: true 
});

module.exports = mongoose.model('Item', itemSchema);