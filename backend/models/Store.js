const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true }, 
  location: {
    address: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  operatingHours: {
    open: { type: String, default: '08:00' },
    close: { type: String, default: '17:00' }
  }
}, { timestamps: true });

module.exports = mongoose.model('Store', storeSchema);