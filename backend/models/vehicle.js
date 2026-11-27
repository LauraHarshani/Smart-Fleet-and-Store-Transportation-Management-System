const mongoose = require('mongoose');
require('./User');

const vehicleSchema = new mongoose.Schema({
  id: { type: String, unique: true, sparse: true },
  registrationNumber: { type: String, required: true, unique: true, trim: true },
  vin: { type: String, default: '', trim: true },
  model: { type: String, required: true, trim: true },
  type: { type: String, required: true, trim: true },
  capacityWeightKg: { type: Number, required: true, min: 0 },
  capacityVolumeM3: { type: Number, required: true, min: 0 },
  assignedStore: { type: String, default: 'Colombo Main Store', trim: true },
  assignedDriver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  assignedDriverName: { type: String, default: '', trim: true },
  odometerKm: { type: Number, default: 0, min: 0 },
  status: {
    type: String,
    enum: ['Available', 'In Transit', 'Maintenance', 'Inactive'],
    default: 'Available'
  },
  allocationRevision: { type: Number, default: 0 },
  image: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.models.Vehicle || mongoose.model('Vehicle', vehicleSchema);
