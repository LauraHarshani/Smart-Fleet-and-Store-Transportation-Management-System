const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

router.use(protect, allowRoles('ADMIN'));

// Import the controller functions
const { getAllUsers, createUser, updateUser, deactivateUser } = require('../controllers/userController');

// Route to fetch all users from the database
// Matches frontend API call: GET /api/users/
router.get('/', getAllUsers);

// Route to create a new user account
// Matches frontend API call: POST /api/users/add
router.post('/add', createUser);

// Route to update an existing user's details by their ID (e.g., USR-1234)
// Matches frontend API call: PUT /api/users/:id
router.put('/:id', updateUser);

// Route to delete or deactivate a user by their ID
// Matches frontend API call: DELETE /api/users/:id
router.delete('/:id', deactivateUser);

module.exports = router;
