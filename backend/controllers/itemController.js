const Item = require('../models/item');

// 1. Fetch all items (GET)
const getAllItems = async (req, res) => {
    try {
        const items = await Item.find().sort({ createdAt: -1 });
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching items', error: error.message });
    }
};

// 2. Create a new item (POST)
const createItem = async (req, res) => {
    try {
        const newItem = new Item(req.body);
        await newItem.save();
        res.status(201).json({ message: 'Item created successfully', item: newItem });
    } catch (error) {
        res.status(500).json({ message: 'Error creating item', error: error.message });
    }
};

// 3. Update an existing item (PUT)
const updateItem = async (req, res) => {
    try {
        const { id } = req.params; 
        
        const updatedItem = await Item.findOneAndUpdate(
            { id: id }, 
            req.body, 
            { new: true } 
        );

        if (!updatedItem) return res.status(404).json({ message: 'Item not found' });
        res.status(200).json({ message: 'Item updated successfully', item: updatedItem });
    } catch (error) {
        res.status(500).json({ message: 'Error updating item', error: error.message });
    }
};

// 4. Delete an item (DELETE)
const deleteItem = async (req, res) => {
    try {
        const { id } = req.params;
        
        const deletedItem = await Item.findOneAndDelete({ id: id });
        if (!deletedItem) return res.status(404).json({ message: 'Item not found' });
        
        res.status(200).json({ message: 'Item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting item', error: error.message });
    }
};

module.exports = { getAllItems, createItem, updateItem, deleteItem };