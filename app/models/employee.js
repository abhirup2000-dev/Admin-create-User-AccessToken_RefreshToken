const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const EmployeeSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum:['employee','admin','manager'],
      default: 'employee'
    },
    isActive:{
      type: Boolean,
      default: true
    },
    is_FirstLogin:{
      type: Boolean,
      default: true
    },
  },
  { timestamps: true },
);

const EmployeeModel = mongoose.model("Employee_model", EmployeeSchema);

module.exports = EmployeeModel;
