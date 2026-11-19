const Store = require('../models/store');

const parseCapacityNumber = (capStr) => {
  if (!capStr) return 0;
  const num = parseFloat(String(capStr).replace(/[^0-9.]/g, ''));
  return Number.isNaN(num) ? 0 : num;
};

const enrichStoreWithLiveDBMetrics = async (storeDoc) => {
  const storeObj = storeDoc.toObject ? storeDoc.toObject() : { ...storeDoc };
  const totalCapMT = parseCapacityNumber(storeObj.capacity);

  let liveUsedMT = null;
  let liveUtilization = storeObj.utilization ?? 0;

  try {
    const mongoose = require('mongoose');
    if (mongoose.modelNames().includes('Item')) {
      const Item = mongoose.model('Item');
      const items = await Item.find({
        $or: [{ storeId: storeObj.id }, { store: storeObj.id }, { store: storeObj.name }]
      }).lean();

      if (Array.isArray(items) && items.length > 0) {
        const sumQty = items.reduce((acc, item) => acc + (Number(item.quantity ?? item.weight ?? 0) || 0), 0);
        liveUsedMT = sumQty;
        if (totalCapMT > 0) {
          liveUtilization = Math.min(100, Math.round((sumQty / totalCapMT) * 100));
        }
      }
    }
  } catch (_) {
    // Keep stored utilization if Item model/query isn't present
  }

  if (liveUsedMT === null) {
    liveUsedMT = Math.round((totalCapMT * (Number(liveUtilization) || 0)) / 100);
  }

  return {
    ...storeObj,
    usedCapacityMT: liveUsedMT,
    utilization: liveUtilization
  };
};

const buildStoreFilter = (rawId) => {
  const decodedId = decodeURIComponent(rawId || '');
  const conditions = [{ id: decodedId }];
  if (/^[0-9a-fA-F]{24}$/.test(decodedId)) {
    conditions.push({ _id: decodedId });
  }
  return { $or: conditions };
};

// 1. Fetch all stores (GET)
const getAllStores = async (req, res) => {
  try {
    const stores = await Store.find().sort({ id: 1, createdAt: 1 });
    const enriched = await Promise.all(stores.map(enrichStoreWithLiveDBMetrics));
    res.status(200).json(enriched);
  } catch (error) {
    console.error('getAllStores error:', error);
    res.status(500).json({ message: 'Error fetching stores', error: error.message });
  }
};

// 2. Create a new store (POST)
const createStore = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (!payload.id || !payload.id.trim()) {
      const prefix = (payload.region || 'STR')
        .replace(/[^A-Za-z]/g, '')
        .slice(0, 3)
        .toUpperCase() || 'STR';
      const suffix = Math.floor(100 + Math.random() * 900);
      payload.id = `ST-${prefix}-${suffix}`;
    }

    const newStore = new Store(payload);
    await newStore.save();
    const enriched = await enrichStoreWithLiveDBMetrics(newStore);
    res.status(201).json({ message: 'Store created successfully', store: enriched });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Store ID already exists' });
    }
    res.status(500).json({ message: 'Error creating store', error: error.message });
  }
};

// 3. Update an existing store details (PUT)
const updateStore = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedStore = await Store.findOneAndUpdate(
      buildStoreFilter(id),
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedStore) {
      return res.status(404).json({ message: 'Store not found' });
    }

    const enriched = await enrichStoreWithLiveDBMetrics(updatedStore);
    res.status(200).json({ message: 'Store updated successfully', store: enriched });
  } catch (error) {
    res.status(500).json({ message: 'Error updating store', error: error.message });
  }
};

// 4. Delete a store (DELETE)
const deleteStore = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedStore = await Store.findOneAndDelete(buildStoreFilter(id));
    if (!deletedStore) {
      return res.status(404).json({ message: 'Store not found' });
    }

    res.status(200).json({ message: 'Store deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting store', error: error.message });
  }
};

module.exports = { getAllStores, createStore, updateStore, deleteStore };
