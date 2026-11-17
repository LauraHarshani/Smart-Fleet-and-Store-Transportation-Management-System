const mongoose = require("mongoose");
const { randomBytes } = require("crypto");

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
        required: true
    },

    isActive:{
        type: String,
        enum: ["Active","Inactive","On Leave"],
        default: "Active"
    }
},{
    timestamps: true
});

module.exports = mongoose.model("authUsers", authUserSchema);