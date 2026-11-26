const mongoose = require('mongoose');

const bookingLineSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  expectedQuantity: { type: Number, required: true }, 
  actualQuantity: { type: Number }, 
  unit: { type: String, required: true } 
}, { timestamps: true });

module.exports = mongoose.model('BookingLine', bookingLineSchema);