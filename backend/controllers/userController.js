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
        const { name, email, phone, role, store, department, status, avatar } = req.body;

        if (!name || !email || !role) {
            return res.status(400).json({ message: 'Name, email, and role are required' });
        }

        if (role !== 'ADMIN' && !store) {
            return res.status(400).json({ message: 'Assigned store is required for non-admin users' });
        }

        // Check if a user with this email already exists
        const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
        if (existingUser) return res.status(400).json({ message: 'Email already exists' });

        // Generate a default password for the new user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('LogiFleet@123', salt);

        const newUser = new User({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            phone: phone ? phone.trim() : '+94 77 000 0000',
            password: hashedPassword,
            role,
            store: role === 'ADMIN' ? null : store,
            department: department ? department.trim() : '',
            isActive: status || 'Active',
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
        const { name, email, phone, role, store, department, status, avatar } = req.body;

        if (role !== 'ADMIN' && !store) {
            return res.status(400).json({ message: 'Assigned store is required for non-admin users' });
        }

        const updatedUser = await User.findOneAndUpdate(
            { id: id }, 
            {
                name: name?.trim(),
                email: email?.toLowerCase().trim(),
                phone: phone?.trim(),
                role,
                store: role === 'ADMIN' ? null : store,
                department: department !== undefined ? department.trim() : '',
                isActive: status,
                avatar
            }, 
            { returnDocument: 'after', runValidators: true }
        ).select('-password');

        if (!updatedUser) return res.status(404).json({ message: 'User not found' });

        const userResponse = updatedUser.toObject();
        userResponse.status = userResponse.isActive;

        res.status(200).json(userResponse);
    } catch (error) {
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }
};

// 4. Deactivate a user (Soft Delete)
const deactivateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const deactivatedUser = await User.findOneAndUpdate(
            { id: id },
            { isActive: 'Inactive' },
            { returnDocument: 'after' }
        ).select('-password');
        
        if (!deactivatedUser) return res.status(404).json({ message: 'User not found' });

        const userResponse = deactivatedUser.toObject();
        userResponse.status = userResponse.isActive;

        res.status(200).json({ message: 'User deactivated successfully', user: userResponse });
    } catch (error) {
        res.status(500).json({ message: 'Error deactivating user', error: error.message });
    }
};

module.exports = { getAllUsers, createUser, updateUser, deactivateUser };
