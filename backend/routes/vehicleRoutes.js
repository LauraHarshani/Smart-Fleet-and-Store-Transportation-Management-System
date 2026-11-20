const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');
const { auditMutation } = require('../middleware/auditMutationMiddleware');

router.use(protect, allowRoles('ADMIN'), auditMutation);

// Import the controller functions
const { getAllVehicles, createVehicle, updateVehicle, deleteVehicle } = require('../controllers/vehicleController');

// Route to fetch all vehicles
// Method: GET | Endpoint: /api/vehicles/
router.get('/', getAllVehicles);

// Route to create a new vehicle
// Method: POST | Endpoint: /api/vehicles/add
router.post('/add', createVehicle);

// Route to update a vehicle by its ID
// Method: PUT | Endpoint: /api/vehicles/:id
router.put('/:id', updateVehicle);

// Route to delete a vehicle by its ID
// Method: DELETE | Endpoint: /api/vehicles/:id
router.delete('/:id', deleteVehicle);

module.exports = router;
