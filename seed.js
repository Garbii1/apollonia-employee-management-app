// seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const Department = require('./models/department.model');
const Employee = require('./models/employee.model');

// Use the URI from .env, but default to localhost connection suitable for running outside Docker direct to exposed port
const MONGODB_URI = process.env.MONGODB_URI_SEED || 'mongodb://localhost:27017/apolloniaDb';

const departmentsData = [
  { name: "General Dentistry" },
  { name: "Pediatric Dentistry" },
  { name: "Restorative Dentistry" },
  { name: "Surgery" },
  { name: "Orthodontics" }
];

// Use department names for initial mapping
const employeesData = [
  { firstName: "Lisa", lastName: "Harris", departmentNames: ["Restorative Dentistry", "Orthodontics"] },
  { firstName: "Alfred", lastName: "Christensen", departmentNames: ["General Dentistry"] },
  { firstName: "John", lastName: "Dudley", departmentNames: ["General Dentistry"] },
  { firstName: "Danny", lastName: "Perez", departmentNames: ["Restorative Dentistry"] },
  { firstName: "Sarah", lastName: "Alvarez", departmentNames: ["Pediatric Dentistry"] },
  { firstName: "Constance", lastName: "Smith", departmentNames: ["Surgery"] },
  { firstName: "Travis", lastName: "Combs", departmentNames: ["General Dentistry"] }, // Assigning Travis as per previous assumption
  { firstName: "Francisco", lastName: "Willard", departmentNames: ["Pediatric Dentistry"] },
  { firstName: "Janet", lastName: "Doe", departmentNames: ["General Dentistry"] },
  { firstName: "Leslie", lastName: "Roche", departmentNames: ["Orthodontics"] }
];

const seedDatabase = async () => {
  try {
    console.log(`Connecting to MongoDB at ${MONGODB_URI} for seeding...`);
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB Connected for seeding.');

    console.log('Clearing existing Employees and Departments...');
    await Employee.deleteMany({});
    await Department.deleteMany({});
    console.log('Existing data cleared.');

    console.log('Inserting Departments...');
    // Use insertMany for efficiency and capture inserted docs with IDs
    const insertedDepartments = await Department.insertMany(departmentsData);
    console.log(`${insertedDepartments.length} departments inserted.`);

    // Create a map of department names to their newly created _id
    const departmentMap = insertedDepartments.reduce((map, dept) => {
      map[dept.name] = dept._id;
      return map;
    }, {});
    console.log('Department Name-to-ID map created.');

    // Prepare Employee documents with ObjectId references
    const employeesToInsert = employeesData.map(emp => {
        const departmentIds = emp.departmentNames
            .map(name => departmentMap[name]) // Map name to ID from our map
            .filter(id => !!id); // Filter out any nulls if a name didn't match
        if(departmentIds.length !== emp.departmentNames.length) {
             console.warn(`Warning: Could not find matching IDs for all departments for ${emp.firstName} ${emp.lastName}. Mapped ${departmentIds.length}/${emp.departmentNames.length}. Missing: ${emp.departmentNames.filter(name => !departmentMap[name]).join(', ')}`);
        }
        if (departmentIds.length === 0) {
            console.error(`ERROR: No valid departments found for ${emp.firstName} ${emp.lastName}. Skipping employee.`);
            return null; // Skip employees with no valid departments after mapping
        }
        return {
            firstName: emp.firstName,
            lastName: emp.lastName,
            departments: departmentIds // Use the array of ObjectIDs
        };
    }).filter(emp => emp !== null); // Remove any null entries (skipped employees)


    if (employeesToInsert.length > 0) {
        console.log('Inserting Employees...');
        const insertedEmployees = await Employee.insertMany(employeesToInsert);
        console.log(`${insertedEmployees.length} employees inserted.`);
    } else {
         console.log('No valid employees to insert after department mapping.');
    }

    console.log('Database seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Ensure the connection is closed
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
};

// Run the seeding function
seedDatabase();