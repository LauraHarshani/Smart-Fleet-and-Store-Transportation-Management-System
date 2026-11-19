const Vehicle = require('../models/vehicle');

// 1. Fetch all vehicles (GET)
// Matches frontend API call to load all vehicles into the table
const getAllVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.find().sort({ createdAt: -1 });
        res.status(200).json(vehicles);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching vehicles', error: error.message });
    }
};

// 2. Create a new vehicle (POST)
// Matches frontend API call when 'Save Vehicle' is clicked
const createVehicle = async (req, res) => {
    try {
        const newVehicle = new Vehicle(req.body);
        await newVehicle.save();
        res.status(201).json({ message: 'Vehicle created successfully', vehicle: newVehicle });
    } catch (error) {
        res.status(500).json({ message: 'Error creating vehicle', error: error.message });
    }
};

// 3. Update an existing vehicle details (PUT)
// Matches frontend API call when 'Save Changes' is clicked in Edit mode
const updateVehicle = async (req, res) => {
    try {
        const { id } = req.params; // The Vehicle ID (e.g., VH-401)
        
        const updatedVehicle = await Vehicle.findOneAndUpdate(
            { id: id }, 
            req.body, 
            { new: true } // Returns the updated document
        );

        if (!updatedVehicle) return res.status(404).json({ message: 'Vehicle not found' });
        res.status(200).json({ message: 'Vehicle updated successfully', vehicle: updatedVehicle });
    } catch (error) {
        res.status(500).json({ message: 'Error updating vehicle', error: error.message });
    }
};

// 4. Delete a vehicle (DELETE)
// Matches frontend API call when the Trash icon is clicked
const deleteVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        
        const deletedVehicle = await Vehicle.findOneAndDelete({ id: id });
        if (!deletedVehicle) return res.status(404).json({ message: 'Vehicle not found' });
        
        res.status(200).json({ message: 'Vehicle deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting vehicle', error: error.message });
    }
};

module.exports = { getAllVehicles, createVehicle, updateVehicle, deleteVehicle };
