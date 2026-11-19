const mongoose = require("mongoose");
const { randomBytes } = require("crypto");

const bookingItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: String,
      default: "",
      trim: true,
    },
    weight: {
      type: String,
      default: "",
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      immutable: true,
      default: () => `BK-${randomBytes(4).toString("hex").toUpperCase()}`,
    },
    bookingType: {
      type: String,
      enum: ["inbound", "outbound"],
    },
    store: {
      type: String,
      trim: true,
    },
    pickupStore: {
      type: String,
      required: true,
      trim: true,
    },
    destinationStore: {
      type: String,
      required: true,
      trim: true,
    },
    pickupAddress: {
      type: String,
      trim: true,
    },
    destinationAddress: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    scheduledTime: {
      type: String,
      trim: true,
    },
    timeSlot: {
      type: String,
      trim: true,
    },
    bay: {
      type: String,
      trim: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Normal", "High", "Urgent"],
      default: "Normal",
    },
    deliveryType: {
      type: String,
      enum: ["Standard", "Expedited"],
      default: "Standard",
    },
    distance: {
      type: String,
      trim: true,
    },
    transitTime: {
      type: String,
      trim: true,
    },
    vehicle: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: [
        "Draft",
        "Pending",
        "In Review",
        "Approved",
        "Rejected",
        "Changes Requested",
        "Scheduled",
        "In Progress",
        "Completed",
        "Cancelled",
      ],
      default: "Pending",
    },
    weight: {
      type: String,
      trim: true,
    },
    totalItems: {
      type: Number,
      min: 0,
    },
    items: {
      type: [bookingItemSchema],
      default: [],
    },
    specialInstructions: {
      type: String,
      trim: true,
    },
    directives: {
      type: [String],
      default: [],
    },
    reviewerNote: {
      type: String,
      trim: true,
    },
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "trips",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("bookings", bookingSchema);
