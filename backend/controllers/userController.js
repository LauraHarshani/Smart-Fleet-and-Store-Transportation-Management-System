const User = require('../models/authUser');
const bcrypt = require('bcryptjs');

// 1. Fetch all users (GET)
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        
        // The frontend uses 'status', so we map the DB field 'isActive' to 'status' before sending
        const formattedUsers = users.map(user => {
            const userObj = user.toObject();
            userObj.status = userObj.isActive; 
            return userObj;
        });

        res.status(200).json(formattedUsers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
};

// 2. Create a new user (POST)
const createUser = async (req, res) => {
    try {
        const { id, name, email, role, store, status, avatar } = req.body;

        // Check if a user with this email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'Email already exists' });

        // Generate a default password for the new user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('LogiFleet@123', salt);

        const newUser = new User({
            id: id, 
            name,
            email,
            phone: "+94 77 000 0000", // Assigning a default phone number since the frontend doesn't provide this required field
            password: hashedPassword,
            role,
            store: role === 'ADMIN' ? null : store,
            isActive: status || 'Active', // Map the frontend 'status' to the DB 'isActive' field
            avatar: avatar || null
        });

        await newUser.save();
        
        // Remove the password from the response object
        const userResponse = newUser.toObject();
        delete userResponse.password;
        userResponse.status = userResponse.isActive;

        res.status(201).json(userResponse);
    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error: error.message });
    }
};

// 3. Update a user (PUT)
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role, store, status, avatar } = req.body;

        const updatedUser = await User.findOneAndUpdate(
            { id: id }, 
            {
                name,
                email,
                role,
                store: role === 'ADMIN' ? null : store,
                isActive: status, // Update the 'isActive' field using the frontend 'status' value
                avatar
            }, 
            { new: true }
        ).select('-password');

        if (!updatedUser) return res.status(404).json({ message: 'User not found' });

        const userResponse = updatedUser.toObject();
        userResponse.status = userResponse.isActive;

        res.status(200).json(userResponse);
    } catch (error) {
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }
};

// 4. Delete/Deactivate a user (DELETE)
const deactivateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedUser = await User.findOneAndDelete({ id: id });
        
        if (!deletedUser) return res.status(404).json({ message: 'User not found' });
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
};

module.exports = { getAllUsers, createUser, updateUser, deactivateUser };