const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  unitOfMeasure: { type: String, required: true }, 
  isHazardous: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);