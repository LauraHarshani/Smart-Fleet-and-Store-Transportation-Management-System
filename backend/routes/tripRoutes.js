const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');
const { auditMutation } = require('../middleware/auditMutationMiddleware');
const { createTrip } = require('../controllers/tripController');

const router = express.Router();

router.use(protect, allowRoles('ADMIN'), auditMutation);

router.post('/add', createTrip);
router.post('/', createTrip);

module.exports = router;
