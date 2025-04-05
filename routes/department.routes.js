// routes/department.routes.js
const express = require('express');
const router = express.Router();
const Department = require('../models/department.model');
const Employee = require('../models/employee.model'); // Needed to check for assigned employees

// Middleware to Get Department by ID
async function getDepartment(req, res, next) {
    let department;
    try {
        department = await Department.findById(req.params.id);
        if (department == null) {
            return res.status(404).json({ message: 'Cannot find department' });
        }
    } catch (err) {
        // Handle invalid ID format
        if (err.name === 'CastError') {
             return res.status(400).json({ message: 'Invalid Department ID format' });
        }
        return res.status(500).json({ message: err.message });
    }
    res.department = department; // Attach department to response object
    next(); // Proceed to the next middleware/route handler
}


// GET all departments
router.get('/', async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 }); // Sort alphabetically
    res.json(departments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST (create) a new department
router.post('/', async (req, res) => {
  const department = new Department({
    name: req.body.name
  });
  try {
    const newDepartment = await department.save();
    res.status(201).json(newDepartment); // 201 Created status
  } catch (err) {
    // Handle validation errors (e.g., duplicate name, missing name)
    if (err.name === 'ValidationError' || err.code === 11000) {
        res.status(400).json({ message: err.message });
    } else {
        res.status(500).json({ message: err.message }); // Other server errors
    }
  }
});

// GET one department by ID (uses getDepartment middleware)
router.get('/:id', getDepartment, (req, res) => {
    res.json(res.department);
});

// PUT (update) a department by ID (uses getDepartment middleware)
router.put('/:id', getDepartment, async (req, res) => {
    // Only update the name if it was provided in the request body
    if (req.body.name != null) {
        res.department.name = req.body.name;
    }
    try {
        const updatedDepartment = await res.department.save();
        res.json(updatedDepartment);
    } catch (err) {
         // Handle validation errors (e.g., duplicate name)
        if (err.name === 'ValidationError' || err.code === 11000) {
            res.status(400).json({ message: err.message });
        } else {
            res.status(500).json({ message: err.message }); // Other server errors
        }
    }
});

// DELETE a department by ID (uses getDepartment middleware)
router.delete('/:id', getDepartment, async (req, res) => {
    try {
        // Check if any employee is assigned to this department BEFORE deleting
        const employeesInDept = await Employee.countDocuments({ departments: req.params.id });
        if (employeesInDept > 0) {
            return res.status(400).json({ message: `Cannot delete department: ${employeesInDept} employee(s) are assigned.` });
        }

        await res.department.deleteOne();
        res.json({ message: 'Deleted Department' }); // Success message
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


module.exports = router;