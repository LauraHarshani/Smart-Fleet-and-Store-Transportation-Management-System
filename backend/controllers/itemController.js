const Item = require('../models/item');

const buildItemFilter = (rawId) => {
  const decodedId = decodeURIComponent(rawId || '');
  const conditions = [{ code: decodedId.toUpperCase() }, { code: decodedId }];
  if (/^[0-9a-fA-F]{24}$/.test(decodedId)) {
    conditions.push({ _id: decodedId });
  }
  return { $or: conditions };
};

const generateUniqueItemCode = async () => {
  for (let i = 0; i < 30; i++) {
    const candidate = `ITM-${Math.floor(1000 + Math.random() * 9000)}`;
    const exists = await Item.findOne({ code: candidate }).lean();
    if (!exists) return candidate;
  }
  return `ITM-${Date.now().toString().slice(-6)}`;
};

// Drop stale unique index on `id` if an older schema created it
let checkedStaleIndex = false;
const ensureCleanItemIndexes = async () => {
  if (checkedStaleIndex) return;
  checkedStaleIndex = true;
  try {
    const indexes = await Item.collection.indexes();
    const staleIdIndex = indexes.find((idx) => idx.name === 'id_1' && idx.unique);
    if (staleIdIndex) {
      await Item.collection.dropIndex('id_1');
    }
  } catch (_) {
    // Ignore index inspection errors
  }
};

// 1. Fetch all items (GET /api/items)
const getAllItems = async (req, res) => {
  try {
    await ensureCleanItemIndexes();
    const items = await Item.find().sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (error) {
    console.error('getAllItems error:', error);
    res.status(500).json({ message: 'Error fetching items', error: error.message });
  }
};

// 2. Create a new item (POST /api/items/add)
const createItem = async (req, res) => {
  try {
    await ensureCleanItemIndexes();
    const payload = { ...req.body };

    const itemName = (payload.name || '').trim();
    const uom = (payload.unitOfMeasure || payload.uom || '').trim();

    if (!itemName || !uom) {
      return res.status(400).json({ message: 'Item name and unit of measure are required.' });
    }

    const category = (payload.category || 'Dry Grocery / Export').trim();
    const isHazardous = payload.isHazardous !== undefined
      ? Boolean(payload.isHazardous)
      : category.toLowerCase().includes('hazmat') || category.toLowerCase().includes('chem');

    const baseDoc = {
      name: itemName,
      description: (payload.description || 'Registered master catalog SKU').trim(),
      category,
      unitOfMeasure: uom,
      weightKg: Math.max(0, Number(payload.weightKg) || 0),
      isHazardous,
      status: payload.status || 'Active',
      handlingConstraints: payload.handlingConstraints || {
        stackable: true,
        tempMonitor: category.toLowerCase().includes('cold'),
        moisture: true,
        fragile: false
      },
      image: payload.image || null
    };

    let candidateCode = (payload.code || payload.id || '').trim().toUpperCase();
    if (!candidateCode) {
      candidateCode = await generateUniqueItemCode();
    }

    let savedItem = null;
    let lastError = null;

    for (let attempt = 0; attempt < 8; attempt++) {
      try {
        const doc = new Item({ ...baseDoc, code: candidateCode });
        savedItem = await doc.save();
        lastError = null;
        break;
      } catch (saveErr) {
        lastError = saveErr;
        const isCodeDuplicate =
          saveErr &&
          saveErr.code === 11000 &&
          (!saveErr.keyPattern || Object.prototype.hasOwnProperty.call(saveErr.keyPattern, 'code'));

        if (isCodeDuplicate) {
          candidateCode = await generateUniqueItemCode();
          continue;
        }
        break;
      }
    }

    if (!savedItem) {
      const detail = lastError?.message || 'Could not save item.';
      const statusCode = lastError?.name === 'ValidationError' ? 400 : 500;
      return res.status(statusCode).json({ message: detail, error: detail });
    }

    res.status(201).json({ message: 'Item created successfully', item: savedItem });
  } catch (error) {
    console.error('createItem error:', error);
    res.status(500).json({ message: error.message || 'Error creating item', error: error.message });
  }
};

// 3. Update an existing item (PUT /api/items/:id)
const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.uom && !updates.unitOfMeasure) {
      updates.unitOfMeasure = updates.uom;
    }
    if (updates.weightKg !== undefined) {
      updates.weightKg = Math.max(0, Number(updates.weightKg) || 0);
    }
    if (updates.category) {
      updates.isHazardous = updates.category.toLowerCase().includes('hazmat') || updates.category.toLowerCase().includes('chem');
    }

    const updatedItem = await Item.findOneAndUpdate(
      buildItemFilter(id),
      updates,
      { returnDocument: 'after', runValidators: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.status(200).json({ message: 'Item updated successfully', item: updatedItem });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Item code / SKU already exists.' });
    }
    res.status(500).json({ message: 'Error updating item', error: error.message });
  }
};

// 4. Delete an item (DELETE /api/items/:id)
const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedItem = await Item.findOneAndDelete(buildItemFilter(id));
    if (!deletedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting item', error: error.message });
  }
};

module.exports = { getAllItems, createItem, updateItem, deleteItem };