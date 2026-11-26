const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');
const { auditMutation } = require('../middleware/auditMutationMiddleware');
const { getTrips, createTrip, reportTripDelay } = require('../controllers/tripController');

const router = express.Router();

router.use(protect, allowRoles('ADMIN'), auditMutation);

router.get('/', getTrips);
router.post('/add', createTrip);
router.post('/', createTrip);
router.patch('/:id/delay', reportTripDelay);

module.exports = router;
