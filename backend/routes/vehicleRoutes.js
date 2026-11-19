const express = require('express');
const router = express.Router();
const { getVehicles, createVehicle } = require('../controllers/vehicleController');

router.route('/').get(getVehicles).post(createVehicle);

module.exports = router;