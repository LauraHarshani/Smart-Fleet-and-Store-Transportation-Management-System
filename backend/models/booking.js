const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true }, 
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['Inbound', 'Outbound'], required: true },
  scheduledDate: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
  status: { 
    type: String, 
    enum: ['Draft', 'Pending', 'Scheduled', 'In Transit', 'Arrived', 'Completed', 'Cancelled'], 
    default: 'Draft' 
  },
  // BE-9: Store Confirmation 
  confirmation: {
    isPrepared: { type: Boolean, default: false },
    isHandedOver: { type: Boolean, default: false },
    isReceived: { type: Boolean, default: false },
    actualWeightKg: { type: Number },
    actualPalletCount: { type: Number },
    hasDiscrepancy: { type: Boolean, default: false },
    discrepancyNotes: { type: String }
  }
}, { timestamps: true });

// BE-2: Indexes
bookingSchema.index({ status: 1 });
bookingSchema.index({ store: 1, scheduledDate: 1 });

module.exports = mongoose.model('Booking', bookingSchema);