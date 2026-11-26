const express = require('express');
const router = express.Router();
const { getStoreSchedule } = require('../controllers/scheduleController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');
const { storeScope } = require('../middleware/storeScopeMiddleware');

router.use(protect, allowRoles('ADMIN', 'STORE MANAGER', 'STORE EMPLOYEE'), storeScope);
router.get('/', getStoreSchedule);

module.exports = router;
