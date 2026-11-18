const Store = require('../models/store');

// 1. Fetch all stores (GET)
// Matches frontend API call to load all stores into the table
const getAllStores = async (req, res) => {
    try {
        const stores = await Store.find().sort({ createdAt: -1 });
        res.status(200).json(stores);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stores', error: error.message });
    }
};

// 2. Create a new store (POST)
// Matches frontend API call when 'Save Store' is clicked
const createStore = async (req, res) => {
    try {
        const newStore = new Store(req.body);
        await newStore.save();
        res.status(201).json({ message: 'Store created successfully', store: newStore });
    } catch (error) {
        res.status(500).json({ message: 'Error creating store', error: error.message });
    }
};

// 3. Update an existing store details (PUT)
// Matches frontend API call when 'Save Store Changes' is clicked in Edit mode
const updateStore = async (req, res) => {
    try {
        const { id } = req.params; // The Store ID (e.g., ST-CMB-01)
        
        const updatedStore = await Store.findOneAndUpdate(
            { id: id }, 
            req.body, 
            { new: true } // Returns the updated document
        );

        if (!updatedStore) return res.status(404).json({ message: 'Store not found' });
        res.status(200).json({ message: 'Store updated successfully', store: updatedStore });
    } catch (error) {
        res.status(500).json({ message: 'Error updating store', error: error.message });
    }
};

// 4. Delete a store (DELETE)
// Matches frontend API call when the Trash icon is clicked
const deleteStore = async (req, res) => {
    try {
        const { id } = req.params;
        
        const deletedStore = await Store.findOneAndDelete({ id: id });
        if (!deletedStore) return res.status(404).json({ message: 'Store not found' });
        
        res.status(200).json({ message: 'Store deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting store', error: error.message });
    }
};

module.exports = { getAllStores, createStore, updateStore, deleteStore };