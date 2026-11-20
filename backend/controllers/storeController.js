const Store = require('../models/store');

const REAL_WORLD_MAIN_STORES = [
  {
    id: 'ST-CMB-01',
    name: 'Colombo Main Store',
    region: 'Western Province',
    subRegion: '(Colombo District)',
    address: 'No. 45/2, Peliyagoda Logistics Park, Kandy Road, Kelaniya',
    coordinates: '6.9742° N, 79.8893° E',
    hours: '08:00 AM - 06:00 PM (Mon - Sat)',
    capacity: '24,000 MT',
    docks: '16 Active Docks',
    utilization: 74,
    status: 'Active',
    phone: '+94 11 243 8910',
    rules: 'Max 3 trucks/hour • 40-min bay turnaround • Cold-chain priority',
    operationalClass: 'Central Distribution & Cold-Chain Hub',
    operationalDetails: 'Primary island-wide consolidation center with temperature-controlled bays and automated manifest dispatch.'
  },
  {
    id: 'ST-KND-02',
    name: 'Kandy Regional Depot',
    region: 'Central Province',
    subRegion: '(Kandy District)',
    address: 'No. 118, Katugastota Road, Peradeniya Junction, Kandy',
    coordinates: '7.3297° N, 80.6224° E',
    hours: '08:00 AM - 05:30 PM (Mon - Sat)',
    capacity: '12,500 MT',
    docks: '8 Active Docks',
    utilization: 58,
    status: 'Operational',
    phone: '+94 81 222 6410',
    rules: 'Max 2 trucks/hour • Medium wheelbase & box van bay allocation',
    operationalClass: 'Central Highlands Regional Depot',
    operationalDetails: 'Regional distribution and transit staging hub serving Central Province retail stores and scheduled route stops.'
  },
  {
    id: 'ST-GAL-03',
    name: 'Galle Coastal Staging',
    region: 'Southern Province',
    subRegion: '(Galle District)',
    address: 'No. 28, Wakwella Road, Port Access Zone, Galle',
    coordinates: '6.0535° N, 80.2210° E',
    hours: '08:30 AM - 05:30 PM (Mon - Sat)',
    capacity: '18,200 MT',
    docks: '10 Active Docks',
    utilization: 81,
    status: 'Active',
    phone: '+94 91 224 7150',
    rules: 'Max 2 trucks/hour • Scheduled loading/unloading slot required',
    operationalClass: 'Southern Maritime & Regional Staging Hub',
    operationalDetails: 'Coastal logistics and regional store replenishment hub supporting Southern corridor dispatch and slot scheduling.'
  }
];

const hasIdPath = Boolean(Store && Store.schema && Store.schema.path('id'));

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
      const queryConditions = [];
      if (storeObj.id) queryConditions.push({ storeId: storeObj.id }, { store: storeObj.id });
      if (storeObj._id) queryConditions.push({ storeId: String(storeObj._id) }, { store: String(storeObj._id) });
      if (storeObj.name) queryConditions.push({ store: storeObj.name });

      if (queryConditions.length > 0) {
        const items = await Item.find({ $or: queryConditions }).lean();
        if (Array.isArray(items) && items.length > 0) {
          const sumQty = items.reduce(
            (acc, item) => acc + (Number(item.quantity ?? item.weight ?? 0) || 0),
            0
          );
          liveUsedMT = sumQty;
          if (totalCapMT > 0) {
            liveUtilization = Math.min(100, Math.round((sumQty / totalCapMT) * 100));
          }
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
    id: storeObj.id || String(storeObj._id),
    usedCapacityMT: liveUsedMT,
    utilization: liveUtilization
  };
};

const buildStoreFilter = (rawId) => {
  const decodedId = decodeURIComponent(rawId || '');
  const conditions = [];
  if (hasIdPath) {
    conditions.push({ id: decodedId });
  }
  if (/^[0-9a-fA-F]{24}$/.test(decodedId)) {
    conditions.push({ _id: decodedId });
  }
  return conditions.length > 1 ? { $or: conditions } : (conditions[0] || { _id: decodedId });
};

// 1. Fetch all stores (GET)
const getAllStores = async (req, res) => {
  try {
    if (hasIdPath) {
      for (const hub of REAL_WORLD_MAIN_STORES) {
        await Store.updateOne(
          { id: hub.id },
          { $setOnInsert: hub },
          { upsert: true }
        );
      }
    }

    const stores = await Store.find().sort({ id: 1, createdAt: 1, _id: 1 });
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
    if (hasIdPath && (!payload.id || !payload.id.trim())) {
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
      { returnDocument: 'after', runValidators: true }
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
