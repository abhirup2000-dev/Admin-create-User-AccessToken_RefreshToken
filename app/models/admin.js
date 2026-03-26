
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const AdminSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter valid email"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["admin", "employee"],
      required: true,
    },

    isActive: {
      type: String,
      enum:['Active','Inactive'],
      default: 'Active',
    },

    refreshToken:{
      type: String,
      default: null,
    },

    firstLogin: {
      type: Boolean,
      default: true,
    },

    lastLogin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const AdminModel = mongoose.model("admin", AdminSchema);

module.exports = AdminModel;