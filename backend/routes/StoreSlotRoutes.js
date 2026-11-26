const express = require('express');
const {
  cancelSlot,
  createSlot,
  getSlotById,
  getSlots,
  updateSlot,
} = require('../controllers/StoreSlotController');
const { protect } = require('../middleware/authMiddleware');
const { storeScope } = require('../middleware/storeScopeMiddleware');

const router = express.Router();

router.use(protect, storeScope);
router.route('/')
  .get(getSlots)
  .post(createSlot);
router.route('/:id')
  .get(getSlotById)
  .patch(updateSlot);
router.patch('/:id/cancel', cancelSlot);

module.exports = router;
