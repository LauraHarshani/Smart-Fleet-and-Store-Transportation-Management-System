const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, trim: true, uppercase: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, default: 'Standard commercial catalog item', trim: true },
  category: { type: String, default: 'Dry Grocery / Export', trim: true },
  unitOfMeasure: { type: String, required: true, trim: true },
  weightKg: { type: Number, default: 0, min: 0 },
  isHazardous: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['Active', 'Under Review', 'Restricted', 'Inactive'],
    default: 'Active'
  },
  handlingConstraints: {
    stackable: { type: Boolean, default: true },
    tempMonitor: { type: Boolean, default: false },
    moisture: { type: Boolean, default: true },
    fragile: { type: Boolean, default: false }
  },
  image: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.models.Item || mongoose.model('Item', itemSchema);
