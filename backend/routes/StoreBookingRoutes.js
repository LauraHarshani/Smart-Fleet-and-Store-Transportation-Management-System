const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/StoreBookingController');

router.use(protect);

// Create, list, single view, history, update & cancel
router.post('/', ctrl.createStoreBooking);
router.get('/', ctrl.getStoreBookings);
router.get('/:id', ctrl.getStoreBookingById);
router.get('/:id/history', ctrl.getStoreBookingHistory);
router.put('/:id', ctrl.updateStoreBooking);
router.patch('/:id/cancel', ctrl.cancelStoreBooking);

// Handover/receipt quantities & stop status/timestamps
router.patch('/:id/handover-receipt', ctrl.recordHandoverAndReceipt);
router.patch('/:id/stops/:stopId', ctrl.updateBookingStop);

//  Review & status state machine (Draft -> Completed)
router.patch('/:id/submit', ctrl.submitBooking);
router.patch('/:id/approve', ctrl.approveBooking);
router.patch('/:id/reject', ctrl.rejectBooking);
router.patch('/:id/request-changes', ctrl.requestBookingChanges);
router.patch('/:id/start', ctrl.startBooking);
router.patch('/:id/complete', ctrl.completeBooking);

module.exports = router;
