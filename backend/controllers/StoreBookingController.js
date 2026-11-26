const mongoose = require('mongoose');
const { StoreBooking } = require('../models/StoreBooking');
const { cancelStoreBooking: cancelStoreBookingAndRevalidate } = require('../services/storeBookingCancellationService');
const Store = require('../models/store');
const Item = require('../models/item');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);
const storeRefId = (store) => {
  const id = store && typeof store === 'object' && store._id ? store._id : store;
  return id ? id.toString() : '';
};
const STORE_ROLES = new Set(['store manager', 'store employee']);

const ALLOWED_TRANSITIONS = {
  Draft: ['Submitted', 'Cancelled'],
  Submitted: ['Approved', 'Rejected', 'Changes Requested', 'Cancelled'],
  'Changes Requested': ['Submitted', 'Cancelled'],
  Approved: ['In Progress', 'Cancelled'],
  Rejected: [],
  'In Progress': ['Completed', 'Cancelled'],
  Completed: [],
  Cancelled: [],
};

const addAuditLog = (booking, { action, fromStatus, toStatus, changedBy, reason = '' }) => {
  booking.changeHistory.push({
    action,
    fromStatus: fromStatus ?? null,
    toStatus,
    changedBy: changedBy && isValidId(changedBy) ? changedBy : null,
    reason,
    changedAt: new Date(),
  });
};

// Read-only catalog data used by store users to create a booking.
exports.getStoreBookingOptions = async (req, res) => {
  const scopeErr = checkUserRoleAndStoreScope(req, null, {
    allowedRoles: ['store employee', 'store manager', 'admin'],
  });
  if (scopeErr) return res.status(403).json({ message: scopeErr });

  try {
    const [stores, items] = await Promise.all([
      Store.find({ status: 'Active' }).sort({ id: 1, code: 1, createdAt: 1 }).lean(),
      Item.find({ status: 'Active' }).sort({ name: 1 }).lean(),
    ]);
    return res.status(200).json({ stores, items });
  } catch (err) {
    return res.status(500).json({ message: 'Unable to load booking options', error: err.message });
  }
};

// Role & Store Scope helper (NFR-01, NFR-02, SRS Section 3)
// Enforces checks when req.user is present; allows direct API/Postman testing when req.user is absent.
const checkUserRoleAndStoreScope = (req, booking, { allowedRoles = null, checkBookingStores = false } = {}) => {
  if (!req.user) return null;

  const rawRole = (req.user.role || '').toString().toLowerCase();
  const isAdmin = ['admin', 'system administrator', 'administrator'].includes(rawRole);

  if (Array.isArray(allowedRoles) && allowedRoles.length > 0 && !isAdmin) {
    const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase());
    const isStoreRoleAllowed = STORE_ROLES.has(rawRole) &&
      normalizedAllowed.some((role) => STORE_ROLES.has(role));
    if (!normalizedAllowed.includes(rawRole) && !isStoreRoleAllowed) {
      return `Role "${req.user.role || 'unknown'}" is not permitted for this action`;
    }
  }

  if (checkBookingStores && !isAdmin && booking) {
    const userStoreId = req.user.storeId;
    if (!userStoreId || !isValidId(userStoreId)) {
      return 'No store has been assigned to your account';
    }

    const uStore = userStoreId.toString();
    const pStore = storeRefId(booking.pickupStore);
    const dStore = storeRefId(booking.destinationStore);
    if (uStore !== pStore && uStore !== dStore) {
      return 'Access denied: booking does not belong to your store scope';
    }
  }

  return null;
};

const validateStoresAndItems = async ({ pickupStore, destinationStore, requestedPickupDate, items }) => {
  if (!pickupStore || !isValidId(pickupStore)) {
    return 'Valid pickupStore ID is required';
  }
  if (!destinationStore || !isValidId(destinationStore)) {
    return 'Valid destinationStore ID is required';
  }
  if (pickupStore.toString() === destinationStore.toString()) {
    return 'Pickup store and destination store must be different';
  }
  if (!requestedPickupDate || Number.isNaN(new Date(requestedPickupDate).getTime())) {
    return 'Valid requestedPickupDate is required';
  }
  if (!Array.isArray(items) || items.length === 0) {
    return 'At least one item is required';
  }

  const Store = mongoose.models.Store || require('../models/store');
  const Item = mongoose.models.Item || require('../models/item');

  const [pickup, dest] = await Promise.all([
    Store.findById(pickupStore),
    Store.findById(destinationStore),
  ]);
  if (!pickup) return 'Pickup store not found';
  if (!dest) return 'Destination store not found';

  const seen = new Set();
  for (const line of items) {
    if (!line.item || !isValidId(line.item)) {
      return 'Valid item ID is required in each line';
    }
    const key = line.item.toString();
    if (seen.has(key)) {
      return 'Duplicate items are not allowed in a booking';
    }
    seen.add(key);

    const qty = Number(line.quantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      return 'Quantity must be greater than 0';
    }

    const itemDoc = await Item.findById(line.item);
    if (!itemDoc) {
      return `Item not found: ${line.item}`;
    }
  }

  return null;
};

// BE-4: Create booking
exports.createStoreBooking = async (req, res) => {
  try {
    const scopeErr = checkUserRoleAndStoreScope(req, null, {
      allowedRoles: ['store employee', 'store manager', 'admin'],
    });
    if (scopeErr) return res.status(403).json({ message: scopeErr });

    const body = req.body || {};
    const {
      pickupStore,
      destinationStore,
      requestedBy,
      requestedPickupDate,
      requestedTimeWindow,
      items,
      stops,
    } = body;
    const actorId = req.user?.userId || req.user?._id || requestedBy || req.user?.id;

    if (!actorId || !isValidId(actorId)) {
      return res.status(400).json({ message: 'Valid requestedBy user ID is required' });
    }

    const errorMsg = await validateStoresAndItems({
      pickupStore,
      destinationStore,
      requestedPickupDate,
      items,
    });
    if (errorMsg) {
      return res.status(400).json({ message: errorMsg });
    }

    if (req.user) {
      const rawRole = (req.user.role || '').toString().toLowerCase();
      const isAdmin = ['admin', 'system administrator', 'administrator'].includes(rawRole);
      const userStoreId = req.user.storeId;
      if (!isAdmin && (!userStoreId || userStoreId.toString() !== pickupStore.toString())) {
        return res.status(403).json({
          message: userStoreId
            ? 'You can only create bookings from your assigned store'
            : 'No store has been assigned to your account',
        });
      }
    }

    const booking = new StoreBooking({
      pickupStore,
      destinationStore,
      requestedBy: actorId,
      requestedPickupDate,
      requestedTimeWindow: requestedTimeWindow || {},
      items: items.map((l) => ({
        item: l.item,
        quantity: Number(l.quantity),
        unit: l.unit || 'units',
      })),
      stops: Array.isArray(stops) ? stops : [],
      status: 'Draft',
    });

    addAuditLog(booking, {
      action: 'CREATED',
      fromStatus: null,
      toStatus: 'Draft',
      changedBy: actorId,
      reason: 'Booking created as Draft',
    });

    await booking.save();
    return res.status(201).json({ message: 'Store booking created', booking });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

// BE-4: List bookings (with store scope filtering if user has storeId)
exports.getStoreBookings = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.storeId && isValidId(req.query.storeId)) {
      filter.$or = [{ pickupStore: req.query.storeId }, { destinationStore: req.query.storeId }];
    }

    if (req.user) {
      const rawRole = (req.user.role || '').toString().toLowerCase();
      const isAdmin = ['admin', 'system administrator', 'administrator'].includes(rawRole);
      const userStoreId = req.user.storeId;
      if (!isAdmin && (!userStoreId || !isValidId(userStoreId))) {
        return res.status(403).json({ message: 'No store has been assigned to your account' });
      }
      if (!isAdmin && req.query.storeId && req.query.storeId !== userStoreId.toString()) {
        return res.status(403).json({ message: "Access denied. You cannot access another store's data." });
      }
      if (!isAdmin) {
        filter.$or = [{ pickupStore: userStoreId }, { destinationStore: userStoreId }];
      }
    }

    const bookings = await StoreBooking.find(filter)
      .populate('pickupStore destinationStore items.item stops.store')
      .sort({ createdAt: -1 });

    return res.status(200).json({ count: bookings.length, bookings });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.getStoreBookingById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid booking ID' });
    }
    const booking = await StoreBooking.findById(req.params.id).populate(
      'pickupStore destinationStore items.item stops.store'
    );
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const scopeErr = checkUserRoleAndStoreScope(req, booking, { checkBookingStores: true });
    if (scopeErr) return res.status(403).json({ message: scopeErr });

    return res.status(200).json({ booking });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.getStoreBookingHistory = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid booking ID' });
    }
    const booking = await StoreBooking.findById(req.params.id).select(
      'bookingCode status pickupStore destinationStore changeHistory'
    );
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const scopeErr = checkUserRoleAndStoreScope(req, booking, { checkBookingStores: true });
    if (scopeErr) return res.status(403).json({ message: scopeErr });

    return res.status(200).json({
      bookingCode: booking.bookingCode,
      status: booking.status,
      changeHistory: booking.changeHistory,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// BE-4: Edit booking (Draft or Changes Requested)
exports.updateStoreBooking = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid booking ID' });
    }
    const booking = await StoreBooking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const scopeErr = checkUserRoleAndStoreScope(req, booking, {
      allowedRoles: ['store employee', 'store manager', 'admin'],
      checkBookingStores: true,
    });
    if (scopeErr) return res.status(403).json({ message: scopeErr });

    if (!['Draft', 'Changes Requested'].includes(booking.status)) {
      return res.status(400).json({
        message: `Cannot edit booking when status is "${booking.status}"`,
      });
    }

    const body = req.body || {};
    const nextPickup = body.pickupStore ?? booking.pickupStore;
    const nextDest = body.destinationStore ?? booking.destinationStore;
    const nextDate = body.requestedPickupDate ?? booking.requestedPickupDate;
    const nextItems = body.items ?? booking.items;
    const actorId =
      body.updatedBy || req.user?.userId || req.user?._id || req.user?.id || booking.requestedBy;

    const errorMsg = await validateStoresAndItems({
      pickupStore: nextPickup,
      destinationStore: nextDest,
      requestedPickupDate: nextDate,
      items: nextItems,
    });
    if (errorMsg) {
      return res.status(400).json({ message: errorMsg });
    }

    const currentStatus = booking.status;
    booking.pickupStore = nextPickup;
    booking.destinationStore = nextDest;
    booking.requestedPickupDate = nextDate;
    if (body.requestedTimeWindow) {
      booking.requestedTimeWindow = body.requestedTimeWindow;
    }
    booking.items = nextItems.map((l) => ({
      item: l.item,
      quantity: Number(l.quantity),
      unit: l.unit || 'units',
    }));
    if (Array.isArray(body.stops)) {
      booking.stops = body.stops;
    }

    addAuditLog(booking, {
      action: 'UPDATED',
      fromStatus: currentStatus,
      toStatus: currentStatus,
      changedBy: actorId,
      reason: body.reason || `Booking edited while in ${currentStatus}`,
    });

    await booking.save();
    return res.status(200).json({ message: 'Booking updated', booking });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

// SRS 7.2: Record actual handover and/or receipt quantities per booking line
exports.recordHandoverAndReceipt = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid booking ID' });
    }
    const booking = await StoreBooking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const scopeErr = checkUserRoleAndStoreScope(req, booking, {
      allowedRoles: ['store employee', 'store manager', 'admin'],
      checkBookingStores: true,
    });
    if (scopeErr) return res.status(403).json({ message: scopeErr });

    if (!['Approved', 'In Progress', 'Completed'].includes(booking.status)) {
      return res.status(400).json({
        message: `Handover/receipt quantities can only be recorded when booking is Approved, In Progress, or Completed (current: "${booking.status}")`,
      });
    }

    const body = req.body || {};
    const updates = body.items;
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ message: 'items array is required' });
    }

    for (const upd of updates) {
      const targetLine = booking.items.find(
        (line) =>
          (upd.lineId && line._id && line._id.toString() === upd.lineId.toString()) ||
          (upd.item && line.item && line.item.toString() === upd.item.toString())
      );

      if (!targetLine) {
        return res.status(404).json({ message: 'Matching booking line item not found' });
      }

      if (upd.handedOverQuantity !== undefined && upd.handedOverQuantity !== null) {
        const ho = Number(upd.handedOverQuantity);
        if (!Number.isFinite(ho) || ho < 0) {
          return res.status(400).json({ message: 'handedOverQuantity must be a non-negative number' });
        }
        targetLine.handedOverQuantity = ho;
      }

      if (upd.receivedQuantity !== undefined && upd.receivedQuantity !== null) {
        const rx = Number(upd.receivedQuantity);
        if (!Number.isFinite(rx) || rx < 0) {
          return res.status(400).json({ message: 'receivedQuantity must be a non-negative number' });
        }
        targetLine.receivedQuantity = rx;
      }
    }

    const actorId = body.updatedBy || req.user?.userId || req.user?._id || req.user?.id || booking.requestedBy;
    addAuditLog(booking, {
      action: 'HANDOVER_RECEIPT_RECORDED',
      fromStatus: booking.status,
      toStatus: booking.status,
      changedBy: actorId,
      reason: body.reason || 'Recorded actual handover/receipt quantities',
    });

    await booking.save();
    return res.status(200).json({ message: 'Handover/receipt quantities updated', booking });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

// Update stop status & timestamps (Pending, Arrived, Completed, Skipped)
exports.updateBookingStop = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid booking ID' });
    }
    const booking = await StoreBooking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const scopeErr = checkUserRoleAndStoreScope(req, booking, {
      allowedRoles: ['store employee', 'store manager', 'admin'],
      checkBookingStores: true,
    });
    if (scopeErr) return res.status(403).json({ message: scopeErr });

    const stop = booking.stops.id(req.params.stopId);
    if (!stop) {
      return res.status(404).json({ message: 'Booking stop not found' });
    }

    const body = req.body || {};
    const validStopStatuses = ['Pending', 'Arrived', 'Completed', 'Skipped'];
    if (body.status !== undefined) {
      if (!validStopStatuses.includes(body.status)) {
        return res.status(400).json({ message: 'Invalid stop status' });
      }
      stop.status = body.status;
      if (body.status === 'Arrived' && !stop.actualArrivalAt) {
        stop.actualArrivalAt = body.actualArrivalAt ? new Date(body.actualArrivalAt) : new Date();
      }
      if (body.status === 'Completed' && !stop.actualCompletedAt) {
        stop.actualCompletedAt = body.actualCompletedAt ? new Date(body.actualCompletedAt) : new Date();
      }
    }

    if (body.actualArrivalAt) {
      stop.actualArrivalAt = new Date(body.actualArrivalAt);
    }
    if (body.actualCompletedAt) {
      stop.actualCompletedAt = new Date(body.actualCompletedAt);
    }
    if (body.notes !== undefined) {
      stop.notes = String(body.notes).trim();
    }

    const actorId = body.updatedBy || req.user?.userId || req.user?._id || req.user?.id || booking.requestedBy;
    addAuditLog(booking, {
      action: 'STOP_UPDATED',
      fromStatus: booking.status,
      toStatus: booking.status,
      changedBy: actorId,
      reason: body.reason || `Stop #${stop.sequence} (${stop.stopType}) updated to ${stop.status}`,
    });

    await booking.save();
    return res.status(200).json({ message: 'Booking stop updated', booking });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

// BE-5: Review & status state machine (Draft -> Completed)
const transitionStatus = async (req, res, targetStatus, actionName, allowedRoles = null) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid booking ID' });
    }
    const booking = await StoreBooking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const scopeErr = checkUserRoleAndStoreScope(req, booking, {
      allowedRoles,
      checkBookingStores: true,
    });
    if (scopeErr) return res.status(403).json({ message: scopeErr });

    const allowedNext = ALLOWED_TRANSITIONS[booking.status] || [];
    if (!allowedNext.includes(targetStatus)) {
      return res.status(400).json({
        message: `Invalid status transition from "${booking.status}" to "${targetStatus}"`,
      });
    }

    const body = req.body || {};
    const reason = (body.reason || body.reviewNote || '').trim();
    if (['Rejected', 'Changes Requested', 'Cancelled'].includes(targetStatus) && !reason) {
      return res.status(400).json({
        message: `A reason/note is required for "${targetStatus}"`,
      });
    }

    const actorId =
      body.reviewedBy || body.updatedBy || req.user?.userId || req.user?._id || req.user?.id || booking.requestedBy;
    const prevStatus = booking.status;

    if (targetStatus === 'Cancelled') {
      const result = await cancelStoreBookingAndRevalidate({
        bookingId: booking._id,
        actorId,
        reason,
      });
      return res.status(200).json({
        message: 'Booking cancelled and linked trip reservations revalidated',
        booking: result.booking,
        trip: result.trip,
      });
    }

    booking.status = targetStatus;
    if (['Approved', 'Rejected', 'Changes Requested'].includes(targetStatus)) {
      booking.reviewNote = reason;
      booking.reviewedBy = isValidId(actorId) ? actorId : null;
      booking.reviewedAt = new Date();
    }

    addAuditLog(booking, {
      action: actionName,
      fromStatus: prevStatus,
      toStatus: targetStatus,
      changedBy: actorId,
      reason,
    });

    await booking.save();
    return res.status(200).json({
      message: `Booking status changed to ${targetStatus}`,
      booking,
    });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

exports.submitBooking = (req, res) =>
  transitionStatus(req, res, 'Submitted', 'SUBMITTED', ['store employee', 'store manager', 'admin']);
exports.approveBooking = (req, res) =>
  transitionStatus(req, res, 'Approved', 'APPROVED', ['store manager', 'admin']);
exports.rejectBooking = (req, res) =>
  transitionStatus(req, res, 'Rejected', 'REJECTED', ['store manager', 'admin']);
exports.requestBookingChanges = (req, res) =>
  transitionStatus(req, res, 'Changes Requested', 'CHANGES_REQUESTED', ['store manager', 'admin']);
exports.startBooking = (req, res) =>
  transitionStatus(req, res, 'In Progress', 'IN_PROGRESS', ['store manager', 'admin']);
exports.completeBooking = (req, res) =>
  transitionStatus(req, res, 'Completed', 'COMPLETED', ['store manager', 'admin']);
exports.cancelStoreBooking = (req, res) =>
  transitionStatus(req, res, 'Cancelled', 'CANCELLED', ['store employee', 'store manager', 'admin']);
