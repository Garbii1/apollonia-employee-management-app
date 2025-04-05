// routes/employee.routes.js
const express = require('express');
const router = express.Router();
const Employee = require('../models/employee.model');
const Department = require('../models/department.model'); // Needed for validation and population

// Middleware to Get Employee by ID (and populate departments)
async function getEmployee(req, res, next) {
    let employee;
    try {
        employee = await Employee.findById(req.params.id).populate('departments', 'name _id'); // Populate name and ID
        if (employee == null) {
            return res.status(404).json({ message: 'Cannot find employee' });
        }
    } catch (err) {
         // Handle invalid ID format
         if (err.name === 'CastError') {
             return res.status(400).json({ message: 'Invalid Employee ID format' });
        }
        return res.status(500).json({ message: err.message });
    }
    res.employee = employee; // Attach employee to response object
    next(); // Proceed
}

// Helper function to validate department IDs
async function validateDepartmentIds(departmentIds) {
    if (!departmentIds || !Array.isArray(departmentIds) || departmentIds.length === 0) {
         return { valid: false, message: 'At least one department ID is required.' };
    }
    try {
        const existingDepartments = await Department.find({ '_id': { $in: departmentIds } }).select('_id');
        if (existingDepartments.length !== departmentIds.length) {
             // Find which IDs are invalid (optional, but helpful for debugging)
            const validIds = existingDepartments.map(d => d._id.toString());
            const invalidIds = departmentIds.filter(id => !validIds.includes(id.toString()));
             return { valid: false, message: `Invalid department ID(s) provided: ${invalidIds.join(', ')}` };
        }
        return { valid: true }; // All IDs are valid
    } catch(err) {
        // Handle potential CastErrors if IDs are poorly formatted before DB query
         if (err.name === 'CastError') {
             return { valid: false, message: `Invalid Department ID format found.` };
        }
         console.error("Error validating departments:", err); // Log server error
         return { valid: false, message: 'Server error validating departments.' };
    }
}


// GET all employees (populate department details)
router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find()
        .populate('departments', 'name _id') // Select specific fields: name and _id
        .sort({ lastName: 1, firstName: 1 }); // Sort by last name, then first name
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST (create) a new employee
router.post('/', async (req, res) => {
  const { firstName, lastName, departments } = req.body;

  // Validate Department IDs
  const validationResult = await validateDepartmentIds(departments);
  if (!validationResult.valid) {
      return res.status(400).json({ message: validationResult.message });
  }

  const employee = new Employee({
    firstName,
    lastName,
    departments // Assign validated array of ObjectIds
  });

  try {
    const newEmployee = await employee.save();
    // Populate departments for the response object
    const populatedEmployee = await Employee.findById(newEmployee._id).populate('departments', 'name _id');
    res.status(201).json(populatedEmployee);
  } catch (err) {
     // Handle Mongoose validation errors (e.g., missing fields)
    if (err.name === 'ValidationError') {
        // Collect specific validation error messages (optional)
        const errors = Object.values(err.errors).map(el => el.message);
        res.status(400).json({ message: `Validation Failed: ${errors.join(', ')}` });
    } else {
        res.status(500).json({ message: err.message });
    }
  }
});

// GET one employee by ID (uses getEmployee middleware)
router.get('/:id', getEmployee, (req, res) => {
    res.json(res.employee); // res.employee is already populated by middleware
});

// PUT (update) an employee by ID (uses getEmployee middleware)
router.put('/:id', getEmployee, async (req, res) => {
    const { firstName, lastName, departments } = req.body;

    if (firstName != null && res.employee.firstName !== firstName) {
        res.employee.firstName = firstName;
    }
    if (lastName != null && res.employee.lastName !== lastName) {
        res.employee.lastName = lastName;
    }
    if (departments != null) {
        // Validate the new list of department IDs
        const validationResult = await validateDepartmentIds(departments);
         if (!validationResult.valid) {
            return res.status(400).json({ message: validationResult.message });
         }
         // Check if department list actually changed before updating
         const currentDeptIds = res.employee.departments.map(d => d._id.toString());
         const newDeptIds = departments.map(d => d.toString());
         // Simple comparison (more robust might involve sorting both arrays)
         if (JSON.stringify(currentDeptIds.sort()) !== JSON.stringify(newDeptIds.sort())) {
             res.employee.departments = departments; // Update with new array of ObjectIds
         }
    }

    try {
        const updatedEmployee = await res.employee.save();
         // Repopulate after saving in case only IDs were stored previously
        const populatedEmployee = await Employee.findById(updatedEmployee._id).populate('departments', 'name _id');
        res.json(populatedEmployee);
    } catch (err) {
        // Handle Mongoose validation errors
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map(el => el.message);
            res.status(400).json({ message: `Validation Failed: ${errors.join(', ')}` });
        } else {
            res.status(500).json({ message: err.message });
        }
    }
});

// DELETE an employee by ID (uses getEmployee middleware)
router.delete('/:id', getEmployee, async (req, res) => {
    try {
        await res.employee.deleteOne();
        res.json({ message: 'Deleted Employee' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;