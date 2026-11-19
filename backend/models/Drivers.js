const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
  licenseNumber: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Available', 'On Trip', 'Off Duty'], 
    default: 'Available' 
  },
  rating: { type: Number, default: 5.0 }
}, { timestamps: true });

module.exports = mongoose.model('Driver', driverSchema);