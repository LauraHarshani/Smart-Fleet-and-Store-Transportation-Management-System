const Store = require('../models/store');

const parseCapacityNumber = (capStr) => {
  if (!capStr) return 0;
  const num = parseFloat(String(capStr).replace(/[^0-9.]/g, ''));
  return Number.isNaN(num) ? 0 : num;
};

const parseCoordinates = (value) => {
  if (!value || typeof value !== 'string') return null;
  const numbers = value.match(/-?\d+(?:\.\d+)?/g);
  if (!numbers || numbers.length < 2) return null;
  let lat = Number(numbers[0]);
  let lng = Number(numbers[1]);
  if (/\bS\b/i.test(value) && lat > 0) lat *= -1;
  if (/\bW\b/i.test(value) && lng > 0) lng *= -1;
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return { lat, lng };
};

const normalizeTime = (value) => {
  if (typeof value !== 'string') return null;
  const time = value.trim();
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return null;

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const meridiem = match[3]?.toUpperCase();
  if (minute > 59 || (meridiem && (hour < 1 || hour > 12)) || (!meridiem && hour > 23)) return null;
  if (meridiem) hour = (hour % 12) + (meridiem === 'PM' ? 12 : 0);
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};

const normalizeStoreHours = (value, payload) => {
  const times = String(payload.hours ?? value.hours ?? '').match(/\d{1,2}:\d{2}\s*(?:AM|PM)?/gi) || [];
  const payloadHasHours = Object.prototype.hasOwnProperty.call(payload, 'hours');
  const explicitOpen = normalizeTime(payload.operatingHours?.open);
  const explicitClose = normalizeTime(payload.operatingHours?.close);
  const open = explicitOpen || (payloadHasHours ? normalizeTime(times[0]) : null) || normalizeTime(value.operatingHours?.open) || '08:00';
  const close = explicitClose || (payloadHasHours ? normalizeTime(times[1]) : null) || normalizeTime(value.operatingHours?.close) || '17:00';
  return { open, close };
};

const normalizeDockCount = (value) => {
  if (value === undefined || value === null || value === '') return 4;
  // Accept legacy display values such as "4 Active Docks" while storing a number.
  const match = String(value).trim().match(/^(\d+)\s*(?:active\s+docks?)?$/i);
  return match ? Number(match[1]) : Number.NaN;
};

const normalizeStorePayload = (payload, existing = {}) => {
  const value = { ...existing, ...payload };
  const coordinates = parseCoordinates(value.coordinates) || value.location;
  const hours = value.hours || '';
  const operatingHours = normalizeStoreHours(value, payload);
  const code = value.code || value.id || `ST-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  return {
    id: value.id || code,
    code,
    name: value.name,
    location: {
      address: value.address || value.location?.address || '',
      lat: coordinates?.lat,
      lng: coordinates?.lng,
    },
    address: value.address || value.location?.address || '',
    coordinates: value.coordinates || (coordinates ? `${coordinates.lat}, ${coordinates.lng}` : ''),
    operatingHours,
    hours: value.hours || `${operatingHours.open} - ${operatingHours.close}`,
    region: value.region || '',
    subRegion: value.subRegion || '',
    phone: value.phone || '',
    rules: value.rules || '',
    capacity: value.capacity || '0 MT',
    docks: normalizeDockCount(value.docks),
    utilization: Number(value.utilization) || 0,
    status: value.status || 'Active',
    operationalClass: value.operationalClass || 'Standard Transit Depot',
    operationalDetails: value.operationalDetails || 'Standard storage operations.',
  };
};

const enrichStoreWithLiveDBMetrics = async (storeDoc) => {
  const storeObj = storeDoc.toObject ? storeDoc.toObject() : { ...storeDoc };
  const totalCapMT = parseCapacityNumber(storeObj.capacity);

  const liveUtilization = Number(storeObj.utilization) || 0;
  const liveUsedMT = Math.round((totalCapMT * liveUtilization) / 100);

  return {
    ...storeObj,
    id: storeObj.id || storeObj.code || String(storeObj._id),
    region: storeObj.region || '',
    address: storeObj.address || storeObj.location?.address || '',
    coordinates: storeObj.coordinates || `${storeObj.location?.lat ?? ''}, ${storeObj.location?.lng ?? ''}`,
    hours: storeObj.hours || `${storeObj.operatingHours?.open || '08:00'} - ${storeObj.operatingHours?.close || '17:00'}`,
    usedCapacityMT: liveUsedMT,
    utilization: liveUtilization
  };
};

const buildStoreFilter = (rawId) => {
  const decodedId = decodeURIComponent(rawId || '');
  const conditions = [{ id: decodedId }, { code: decodedId }];
  if (/^[0-9a-fA-F]{24}$/.test(decodedId)) {
    conditions.push({ _id: decodedId });
  }
  return { $or: conditions };
};

// 1. Fetch all stores (GET)
const getAllStores = async (req, res) => {
  try {
    const stores = await Store.find().sort({ id: 1, code: 1, createdAt: 1 });
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
    const payload = normalizeStorePayload(req.body);
    if (!payload.name?.trim() || !payload.location.address || !Number.isFinite(payload.location.lat) || !Number.isFinite(payload.location.lng)) {
      return res.status(400).json({ message: 'Store name, address, and valid coordinates are required.' });
    }

    const newStore = new Store(payload);
    await newStore.save();
    const enriched = await enrichStoreWithLiveDBMetrics(newStore);
    res.status(201).json({ message: 'Store created successfully', store: enriched });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'Store name or code already exists' });
    if (error.name === 'ValidationError' || error.name === 'CastError') return res.status(400).json({ message: error.message });
    res.status(500).json({ message: 'Error creating store', error: error.message });
  }
};

// 3. Update an existing store details (PUT)
const updateStore = async (req, res) => {
  try {
    const { id } = req.params;
    const existingStore = await Store.findOne(buildStoreFilter(id));
    if (!existingStore) return res.status(404).json({ message: 'Store not found' });
    const payload = normalizeStorePayload(req.body, existingStore.toObject());
    const updatedStore = await Store.findByIdAndUpdate(
      existingStore._id,
      payload,
      { returnDocument: 'after', runValidators: true }
    );

    const enriched = await enrichStoreWithLiveDBMetrics(updatedStore);
    res.status(200).json({ message: 'Store updated successfully', store: enriched });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'Store name or code already exists' });
    if (error.name === 'ValidationError' || error.name === 'CastError') return res.status(400).json({ message: error.message });
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
