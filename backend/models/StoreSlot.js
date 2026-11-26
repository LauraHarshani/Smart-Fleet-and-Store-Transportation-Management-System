const mongoose = require('mongoose');

const storeSlotSchema = new mongoose.Schema({
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  date: { type: Date, required: true }, 
  startTime: { type: String, required: true }, 
  endTime: { type: String, required: true },   
  bay: { type: String, required: true },       
  type: { type: String, enum: ['Inbound', 'Outbound'], required: true }, 
  status: { type: String, enum: ['Available', 'Booked', 'Blocked'], default: 'Available' },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' } 
}, { timestamps: true });

// BE-2: Indexes 
storeSlotSchema.index({ store: 1, date: 1 });
storeSlotSchema.index({ status: 1 });

module.exports = mongoose.model('StoreSlot', storeSlotSchema);