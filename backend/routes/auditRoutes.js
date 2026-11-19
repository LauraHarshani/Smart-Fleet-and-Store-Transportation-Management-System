const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');
const { getAuditLogs } = require('../controllers/auditController');

router.use(protect, allowRoles('ADMIN'));
router.route('/').get(getAuditLogs);

module.exports = router;
