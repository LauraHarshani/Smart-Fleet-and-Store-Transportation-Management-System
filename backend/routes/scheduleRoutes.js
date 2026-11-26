const express = require('express');
const router = express.Router();
const { getStoreSchedule } = require('../controllers/scheduleController');

router.route('/').get(getStoreSchedule);

module.exports = router;