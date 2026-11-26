const mongoose = require('mongoose');
const User = require('../models/authUser');
const Store = require('../models/store');

const findAssignedStore = async (value) => {
    if (typeof value !== 'string' || !value.trim()) return null;
    const assignedStore = value.trim();
    if (mongoose.Types.ObjectId.isValid(assignedStore)) {
        return Store.findById(assignedStore);
    }
    return Store.findOne({
        $or: [
            { name: assignedStore },
            { code: assignedStore },
            { id: assignedStore },
        ],
    });
};

const publicUser = (user) => {
    const result = user.toObject ? user.toObject() : { ...user };
    delete result.password;
    result.status = user.status;
    return result;
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        return res.status(200).json(users.map(publicUser));
    } catch (error) {
        console.error('Get users error:', error);
        return res.status(500).json({ message: 'Error fetching users' });
    }
};

const createUser = async (req, res) => {
    try {
        const { name, email, phone, role, store, department, status, avatar } = req.body;
        if (!name?.trim() || !email?.trim() || !role) {
            return res.status(400).json({ message: 'Name, email, and role are required' });
        }
        if (role !== 'ADMIN' && !store?.trim()) {
            return res.status(400).json({ message: 'Assigned store is required for non-admin users' });
        }

        const assignedStore = role === 'ADMIN' ? null : await findAssignedStore(store);
        if (role !== 'ADMIN' && !assignedStore) {
            return res.status(400).json({ message: 'Assigned store does not exist. Select an existing store.' });
        }

        const newUser = await User.create({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone?.trim() || '+94 77 000 0000',
            password: 'LogiFleet@123',
            role,
            store: assignedStore?.name || null,
            department: department?.trim() || '',
            status: status || 'Active',
            avatar: avatar || null,
        });
        return res.status(201).json(publicUser(newUser));
    } catch (error) {
        if (error.code === 11000) return res.status(409).json({ message: 'Email already exists' });
        if (error.name === 'ValidationError') return res.status(400).json({ message: error.message });
        console.error('Create user error:', error);
        return res.status(500).json({ message: 'Error creating user' });
    }
};

const updateUser = async (req, res) => {
    try {
        const user = await User.findOne({ id: req.params.id }).select('+tokenVersion');
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { name, email, phone, role, store, department, status, avatar } = req.body;
        const nextRole = role ?? user.role;
        const nextStore = nextRole === 'ADMIN' ? null : (store ?? user.store);
        if (nextRole !== 'ADMIN' && !nextStore) {
            return res.status(400).json({ message: 'Assigned store is required for non-admin users' });
        }
        const assignedStore = nextRole === 'ADMIN' ? null : await findAssignedStore(nextStore);
        if (nextRole !== 'ADMIN' && !assignedStore) {
            return res.status(400).json({ message: 'Assigned store does not exist. Select an existing store.' });
        }

        if (name !== undefined) user.name = name.trim();
        if (email !== undefined) user.email = email.trim().toLowerCase();
        if (phone !== undefined) user.phone = phone.trim();
        if (role !== undefined) user.role = role;
        user.store = assignedStore?.name || null;
        if (department !== undefined) user.department = department.trim();
        if (status !== undefined) {
            if (user.status === 'Active' && status !== 'Active') user.tokenVersion += 1;
            user.status = status;
        }
        if (avatar !== undefined) user.avatar = avatar;

        await user.save();
        return res.status(200).json(publicUser(user));
    } catch (error) {
        if (error.code === 11000) return res.status(409).json({ message: 'Email already exists' });
        if (error.name === 'ValidationError') return res.status(400).json({ message: error.message });
        console.error('Update user error:', error);
        return res.status(500).json({ message: 'Error updating user' });
    }
};

const deactivateUser = async (req, res) => {
    try {
        const user = await User.findOneAndUpdate(
            { id: req.params.id },
            { $set: { status: 'Inactive' }, $inc: { tokenVersion: 1 } },
            { new: true, runValidators: true }
        );
        if (!user) return res.status(404).json({ message: 'User not found' });
        return res.status(200).json({ message: 'User deactivated successfully', user: publicUser(user) });
    } catch (error) {
        console.error('Deactivate user error:', error);
        return res.status(500).json({ message: 'Error deactivating user' });
    }
};

module.exports = { getAllUsers, createUser, updateUser, deactivateUser };
