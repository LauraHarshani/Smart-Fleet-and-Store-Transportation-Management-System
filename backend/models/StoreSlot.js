const mongoose = require("mongoose");
const { randomBytes } = require("crypto");

const slotSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      immutable: true,
      default: () => `SL-${randomBytes(4).toString("hex").toUpperCase()}`,
    },

    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },

    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "trips",
      required: true,
    },

    stopId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    vehicle: {
      type: String,
      required: true,
      trim: true,
    },

    operationType: {
      type: String,
      enum: ["Loading", "Unloading", "Maintenance"],
      required: true,
    },

    startAt: {
      type: Date,
      required: true,
    },

    endAt: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "Reserved",
        "Confirmed",
        "Cancelled",
        "Rescheduled",
        "Completed",
      ],
      default: "Reserved",
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

// Ensure the end time is later than the start time
slotSchema.pre("validate", function () {
  if (this.startAt && this.endAt && this.endAt <= this.startAt) {
    this.invalidate("endAt", "End time must be later than start time.");
  }
});

// Useful indexes for retrieving reservations
slotSchema.index({ store: 1, startAt: 1, endAt: 1 });
slotSchema.index({ trip: 1, stopId: 1 });

module.exports = mongoose.models.StoreSlot || mongoose.model("StoreSlot", slotSchema);