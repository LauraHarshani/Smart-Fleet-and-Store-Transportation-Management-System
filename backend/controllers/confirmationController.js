const Booking = require('../models/booking');
const BookingLine = require('../models/BookingLine');

// @desc    Confirm Handover/Receipt & Update Actual Quantities
// @route   PUT /api/confirmations/:bookingId
const confirmBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { actualWeightKg, actualPalletCount, lines, hasDiscrepancy, discrepancyNotes } = req.body;

    const booking = await Booking.findOne({ bookingId: bookingId });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // Confirmation State Update 
    booking.confirmation.isReceived = true;
    booking.confirmation.actualWeightKg = actualWeightKg;
    booking.confirmation.actualPalletCount = actualPalletCount;
    booking.confirmation.hasDiscrepancy = hasDiscrepancy;
    booking.confirmation.discrepancyNotes = discrepancyNotes;
    booking.status = hasDiscrepancy ? 'Partially Completed' : 'Completed';

    await booking.save();

    // Booking Lines 
    if (lines && lines.length > 0) {
      for (let line of lines) {
        await BookingLine.findByIdAndUpdate(line.lineId, {
          actualQuantity: line.actualQuantity
        });
      }
    }

    res.status(200).json({ success: true, message: 'Booking confirmed successfully', data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { confirmBooking };