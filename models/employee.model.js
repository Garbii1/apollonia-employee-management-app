// models/employee.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const employeeSchema = new Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required.'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required.'],
    trim: true
  },
  departments: [{ // Array of department ObjectIDs
    type: Schema.Types.ObjectId,
    ref: 'Department', // Reference to the Department model
    required: [true, 'At least one department assignment is required.']
  }]
}, { timestamps: true });

// Ensure an employee cannot be saved without at least one department ID
employeeSchema.path('departments').validate(function (value) {
    return value.length > 0;
}, 'At least one department must be selected.');


module.exports = mongoose.model('Employee', employeeSchema);