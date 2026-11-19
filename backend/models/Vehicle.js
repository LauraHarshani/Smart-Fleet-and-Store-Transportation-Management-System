const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  registrationNumber: { type: String, required: true, unique: true }, 
  type: { type: String, required: true }, 
  capacityWeightKg: { type: Number, required: true },
  capacityVolumeM3: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['Available', 'In Transit', 'Maintenance', 'Inactive'], 
    default: 'Available' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);