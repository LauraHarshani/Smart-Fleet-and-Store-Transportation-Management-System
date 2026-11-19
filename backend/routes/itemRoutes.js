const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

router.use(protect, allowRoles('ADMIN'));

const { getAllItems, createItem, updateItem, deleteItem } = require('../controllers/itemController');

// Routes for Item Management
router.get('/', getAllItems);
router.post('/add', createItem);
router.put('/:id', updateItem);
router.delete('/:id', deleteItem);

module.exports = router;
