const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');
const { auditMutation } = require('../middleware/auditMutationMiddleware');

router.use(protect, allowRoles('ADMIN'), auditMutation);

// Import the controller functions
const { getAllStores, createStore, updateStore, deleteStore } = require('../controllers/storeController');

// Route to fetch all stores
// Method: GET | Endpoint: /api/stores/
router.get('/', getAllStores);

// Route to create a new store
// Method: POST | Endpoint: /api/stores/add
router.post('/add', createStore);

// Route to update a store by its ID
// Method: PUT | Endpoint: /api/stores/:id
router.put('/:id', updateStore);

// Route to delete a store by its ID
// Method: DELETE | Endpoint: /api/stores/:id
router.delete('/:id', deleteStore);

module.exports = router;
