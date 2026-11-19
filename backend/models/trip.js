const mongoose = require("mongoose");
const { randomBytes } = require("crypto");

const tripStopSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["ORIGIN", "DROP", "PICK & DROP", "RETURN"],
    required: true,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  time: {
    type: String,
    trim: true,
  },
  window: {
    type: String,
    trim: true,
  },
  items: {
    type: [String],
    default: [],
  },
});

const tripEventSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    current: {
      type: Boolean,
      default: false,
    },
    timestamp: Date,
  },
  { _id: false }
);

const tripSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      immutable: true,
      default: () => `TRP-${randomBytes(4).toString("hex").toUpperCase()}`,
    },
    route: {
      type: String,
      required: true,
      trim: true,
    },
    origin: {
      type: String,
      trim: true,
    },
    destination: {
      type: String,
      trim: true,
    },
    date: Date,
    start: {
      type: String,
      trim: true,
    },
    end: {
      type: String,
      trim: true,
    },
      actualStartAt: {
      type: Date,
      default: null
    },
    actualEndAt: {
      type: Date,
      default: null
    },
    vehicle: {
      type: String,
      trim: true,
    },
    driver: {
      type: String,
      trim: true,
    },
    load: {
      type: String,
      trim: true,
    },
    distance: {
      type: String,
      trim: true,
    },
    transitTime: {
      type: String,
      trim: true,
    },
    carbon: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: [
        "Draft",
        "Pending",
        "Assigned",
        "Scheduled",
        "In Progress",
        "Delayed",
        "Completed",
        "Cancelled",
      ],
      default: "Draft",
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    stops: {
      type: [tripStopSchema],
      default: [],
    },
    bookings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "bookings",
      },
    ],
    events: {
      type: [tripEventSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("trips", tripSchema);
