const mongoose = require('mongoose');

const BOOKING_STATUSES = [
  'Draft',
  'Submitted',
  'Changes Requested',
  'Approved',
  'Rejected',
  'In Progress',
  'Completed',
  'Cancelled',
];

// 1. Booking Line schema (Item + positive quantity + handover/receipt tracking)
const bookingLineSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [0.0001, 'Quantity must be greater than 0'],
    },
    unit: {
      type: String,
      trim: true,
      default: 'units',
    },
    handedOverQuantity: {
      type: Number,
      min: 0,
      default: null,
    },
    receivedQuantity: {
      type: Number,
      min: 0,
      default: null,
    },
    inventoryVerifiedQuantity: {
      type: Number,
      min: 0,
      default: null,
    },
  },
  { _id: true }
);

// 2. Booking Stop schema (Ordered pickup/drop stops & time slot/status)
const bookingStopSchema = new mongoose.Schema(
  {
    stopType: {
      type: String,
      enum: ['PICKUP', 'DROP'],
      required: true,
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
    },
    sequence: {
      type: Number,
      required: true,
      min: 1,
    },
    preferredTimeWindow: {
      startTime: { type: String, trim: true, default: '' },
      endTime: { type: String, trim: true, default: '' },
    },
    scheduledSlot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StoreSlot',
      default: null,
    },
    status: {
      type: String,
      enum: ['Pending', 'Arrived', 'Completed', 'Skipped'],
      default: 'Pending',
    },
    actualArrivalAt: { type: Date, default: null },
    actualCompletedAt: { type: Date, default: null },
    notes: { type: String, trim: true, default: '' },
  },
  { _id: true }
);

// Change history entry schema (for BE-4 & BE-5 audit trail)
const bookingChangeLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
    },
    fromStatus: { type: String, default: null },
    toStatus: { type: String, required: true },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reason: { type: String, trim: true, default: '' },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

// 3. Booking main schema
const storeBookingSchema = new mongoose.Schema(
  {
    bookingCode: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    pickupStore: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
    },
    destinationStore: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requestedPickupDate: {
      type: Date,
      required: true,
    },
    requestedTimeWindow: {
      startTime: { type: String, trim: true, default: '' },
      endTime: { type: String, trim: true, default: '' },
    },
    items: {
      type: [bookingLineSchema],
      validate: {
        validator: (lines) => Array.isArray(lines) && lines.length > 0,
        message: 'At least one booking line item is required',
      },
    },
    stops: {
      type: [bookingStopSchema],
      default: [],
    },
    status: {
      type: String,
      enum: BOOKING_STATUSES,
      default: 'Draft',
    },
    reviewNote: {
      type: String,
      trim: true,
      default: '',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    assignedTrip: {
      type: mongoose.Schema.Types.ObjectId,
      // The Trip model is registered as "trips" in models/trip.js.
      ref: 'trips',
      default: null,
    },
    assignedVehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      default: null,
    },
    changeHistory: {
      type: [bookingChangeLogSchema],
      default: [],
    },
  },
  { timestamps: true }
);

// Integrity rules
storeBookingSchema.pre('validate', function () {
  if (
    this.pickupStore &&
    this.destinationStore &&
    this.pickupStore.toString() === this.destinationStore.toString()
  ) {
    throw new Error('Pickup store and destination store must be different');
  }

  if (Array.isArray(this.items) && this.items.length > 0) {
    const seenItems = new Set();
    for (const line of this.items) {
      const idStr = line.item ? line.item.toString() : '';
      if (!idStr) continue;
      if (seenItems.has(idStr)) {
        throw new Error('Duplicate items are not allowed in a single booking');
      }
      seenItems.add(idStr);
    }
  }

  if (
    (!Array.isArray(this.stops) || this.stops.length === 0) &&
    this.pickupStore &&
    this.destinationStore
  ) {
    this.stops = [
      {
        stopType: 'PICKUP',
        store: this.pickupStore,
        sequence: 1,
        preferredTimeWindow: this.requestedTimeWindow || {},
      },
      {
        stopType: 'DROP',
        store: this.destinationStore,
        sequence: 2,
        preferredTimeWindow: this.requestedTimeWindow || {},
      },
    ];
  } else if (Array.isArray(this.stops) && this.stops.length > 0) {
    const seenSeq = new Set();
    for (const stop of this.stops) {
      if (seenSeq.has(stop.sequence)) {
        throw new Error('Booking stop sequence numbers must be unique');
      }
      seenSeq.add(stop.sequence);
    }
  }
});

storeBookingSchema.pre('save', function () {
  if (!this.bookingCode) {
    const rand = Math.floor(1000 + Math.random() * 9000);
    this.bookingCode = `SBK-${Date.now().toString().slice(-6)}-${rand}`;
  }
});

module.exports = {
  StoreBooking: mongoose.models.StoreBooking || mongoose.model('StoreBooking', storeBookingSchema),
  BOOKING_STATUSES,
};
