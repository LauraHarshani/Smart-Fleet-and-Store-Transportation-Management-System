const Vehicle = require('../models/vehicle');
const mongoose = require('mongoose');

const ensureUserModelRegistered = () => {
  if (mongoose.modelNames().includes('User')) return true;
  try {
    require('../models/User');
  } catch (_) {
    // Ignore if User model is registered elsewhere
  }
  return mongoose.modelNames().includes('User');
};

const applyDriverPopulate = (query) => {
  if (ensureUserModelRegistered()) {
    return query.populate('assignedDriver', 'name email phone role status');
  }
  return query;
};

const buildVehicleFilter = (rawId) => {
  const decodedId = decodeURIComponent(rawId || '');
  const conditions = [{ id: decodedId }, { registrationNumber: decodedId }];
  if (/^[0-9a-fA-F]{24}$/.test(decodedId)) {
    conditions.push({ _id: decodedId });
  }
  return { $or: conditions };
};

// Check if a driver is already assigned to another active/in-transit vehicle
const checkDriverConflict = async (driverId, excludeVehicleFilter = null) => {
  if (!driverId || !mongoose.Types.ObjectId.isValid(driverId)) return null;

  const query = {
    assignedDriver: driverId,
    status: { $in: ['Available', 'In Transit'] }
  };

  if (excludeVehicleFilter) {
    const existing = await Vehicle.findOne(excludeVehicleFilter).lean();
    if (existing) {
      query._id = { $ne: existing._id };
    }
  }

  return await Vehicle.findOne(query).lean();
};

// 1. Fetch all vehicles (GET /api/vehicles)
const getAllVehicles = async (req, res) => {
  try {
    const vehicles = await applyDriverPopulate(
      Vehicle.find().sort({ createdAt: -1 })
    );
    res.status(200).json(vehicles);
  } catch (error) {
    console.error('getAllVehicles error:', error);
    res.status(500).json({ message: 'Error fetching vehicles', error: error.message });
  }
};

// 2. Create a new vehicle (POST /api/vehicles/add)
const createVehicle = async (req, res) => {
  try {
    const payload = { ...req.body };

    if (!payload.registrationNumber || !payload.model || !payload.type) {
      return res.status(400).json({ message: 'Registration plate, model, and vehicle type are required.' });
    }

    if (Number(payload.capacityWeightKg) <= 0 || Number(payload.capacityVolumeM3) < 0) {
      return res.status(400).json({ message: 'Maximum capacity must be a positive number.' });
    }

    if (!payload.id || !payload.id.trim()) {
      const count = await Vehicle.countDocuments();
      payload.id = `VH-${401 + count}`;
    }

    if (payload.assignedDriver && mongoose.Types.ObjectId.isValid(payload.assignedDriver)) {
      const conflict = await checkDriverConflict(payload.assignedDriver);
      if (conflict) {
        return res.status(409).json({
          message: `Selected driver is already assigned to active vehicle ${conflict.registrationNumber} (${conflict.id}).`
        });
      }
    } else {
      payload.assignedDriver = null;
    }

    const newVehicle = new Vehicle(payload);
    await newVehicle.save();
    const populated = await applyDriverPopulate(Vehicle.findById(newVehicle._id));

    res.status(201).json({ message: 'Vehicle created successfully', vehicle: populated });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Registration number or Vehicle ID already exists.' });
    }
    res.status(500).json({ message: 'Error creating vehicle', error: error.message });
  }
};

// 3. Update an existing vehicle details (PUT /api/vehicles/:id)
const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const filter = buildVehicleFilter(id);
    const updates = { ...req.body };

    if (updates.capacityWeightKg !== undefined && Number(updates.capacityWeightKg) <= 0) {
      return res.status(400).json({ message: 'Maximum capacity must be greater than zero.' });
    }

    if (updates.assignedDriver && mongoose.Types.ObjectId.isValid(updates.assignedDriver)) {
      const conflict = await checkDriverConflict(updates.assignedDriver, filter);
      if (conflict) {
        return res.status(409).json({
          message: `Selected driver is already assigned to active vehicle ${conflict.registrationNumber} (${conflict.id}).`
        });
      }
    } else if (!updates.assignedDriver || updates.assignedDriver === '') {
      updates.assignedDriver = null;
      updates.assignedDriverName = '';
    }

    const updatedVehicle = await applyDriverPopulate(
      Vehicle.findOneAndUpdate(
        filter,
        updates,
        { returnDocument: 'after', runValidators: true }
      )
    );

    if (!updatedVehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    res.status(200).json({ message: 'Vehicle updated successfully', vehicle: updatedVehicle });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Registration number already exists.' });
    }
    res.status(500).json({ message: 'Error updating vehicle', error: error.message });
  }
};

// 4. Delete a vehicle (DELETE /api/vehicles/:id)
const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedVehicle = await Vehicle.findOneAndDelete(buildVehicleFilter(id));
    if (!deletedVehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    res.status(200).json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting vehicle', error: error.message });
  }
};

module.exports = { getAllVehicles, createVehicle, updateVehicle, deleteVehicle };