const mongoose = require("mongoose");
const { randomBytes } = require("crypto");
const bcrypt = require("bcryptjs");

const authUserSchema = new mongoose.Schema({

    id: {
      type: String,
      unique: true,
      immutable: true,
      default: () =>
        `USR-${randomBytes(4).toString("hex").toUpperCase()}`,
    },

    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true
    },

    phone: {
        type: String,
        required: true,
        trim: true
    },

    role: {
        type: String,
        enum: ["ADMIN","STORE MANAGER","STORE EMPLOYEE","DRIVER"],
        required: true
    },

    store: {
      type: String,
      default: null,
      required: function () {
        return this.role !== "ADMIN";
      },
    },

    department: {
      type: String,
      default: "",
      trim: true,
    },

    avatar: {
      type: String,
      default: null,
    },

    password: {
        type: String,
        required: true,
        select: false
    },

    tokenVersion: {
      type: Number,
      default: 0,
      select: false,
    },

    status:{
        type: String,
        enum: ["Active","Inactive","On Leave"],
        default: "Active"
    }
},{
    timestamps: true
});

// Hash the password before saving it to the database
authUserSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 12);
});

module.exports = mongoose.model("authUsers", authUserSchema);
