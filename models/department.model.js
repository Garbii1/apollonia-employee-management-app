// models/department.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const departmentSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Department name is required.'], // Added custom error message
    unique: true,
    trim: true
  }
}, { timestamps: true }); // Adds createdAt and updatedAt fields

module.exports = mongoose.model('Department', departmentSchema);