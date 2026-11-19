const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('../controllers/auditController');

router.route('/').get(getAuditLogs);

module.exports = router;