const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  id: { type: String, unique: true, sparse: true, trim: true },
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
  },
  region: { type: String, default: '' },
  subRegion: { type: String, default: '' },
  address: { type: String, default: '' },
  coordinates: { type: String, default: '' },
  phone: { type: String, default: '' },
  hours: { type: String, default: '' },
  rules: { type: String, default: '' },
  capacity: { type: String, default: '0 MT' },
  docks: { type: String, default: '4 Active Docks' },
  utilization: { type: Number, default: 0, min: 0, max: 100 },
  status: { type: String, default: 'Active' },
  operationalClass: { type: String, default: 'Standard Transit Depot' },
  operationalDetails: { type: String, default: 'Standard storage operations.' }
}, { timestamps: true });

module.exports = mongoose.model('Store', storeSchema);
