const Vehicle = require('../models/vehicle');
const mongoose = require('mongoose');
const AuthUser = require('../models/authUser');

const applyDriverPopulate = (query) => {
  return query.populate('assignedDriver', 'name email phone role status');
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

const isActiveDriver = async (driverId) => {
  if (!mongoose.Types.ObjectId.isValid(driverId)) return false;
  return Boolean(await AuthUser.exists({ _id: driverId, role: 'DRIVER', status: 'Active' }));
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

    const weight = Number(payload.capacityWeightKg);
    const volume = Number(payload.capacityVolumeM3);
    if (!Number.isFinite(weight) || weight <= 0 || !Number.isFinite(volume) || volume < 0) {
      return res.status(400).json({ message: 'Maximum capacity must be a positive number.' });
    }

    if (!payload.id || !payload.id.trim()) {
      const count = await Vehicle.countDocuments();
      payload.id = `VH-${401 + count}`;
    }

    if (payload.assignedDriver) {
      if (!(await isActiveDriver(payload.assignedDriver))) {
        return res.status(400).json({ message: 'Select an active driver account.' });
      }
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

    if (updates.capacityWeightKg !== undefined && (!Number.isFinite(Number(updates.capacityWeightKg)) || Number(updates.capacityWeightKg) <= 0)) {
      return res.status(400).json({ message: 'Maximum capacity must be greater than zero.' });
    }
    if (updates.capacityVolumeM3 !== undefined && (!Number.isFinite(Number(updates.capacityVolumeM3)) || Number(updates.capacityVolumeM3) < 0)) {
      return res.status(400).json({ message: 'Cargo volume must be zero or greater.' });
    }

    if (updates.assignedDriver) {
      if (!(await isActiveDriver(updates.assignedDriver))) {
        return res.status(400).json({ message: 'Select an active driver account.' });
      }
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
