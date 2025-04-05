// server.js
require('dotenv').config(); // Load .env variables into process.env
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

// Import Routes
const departmentRoutes = require('./routes/department.routes');
const employeeRoutes = require('./routes/employee.routes');

const app = express();
const PORT = process.env.PORT || 3000; // Use port from .env or default to 3000
const MONGODB_URI = process.env.MONGODB_URI; // Get URI from .env

if (!MONGODB_URI) {
    console.error("FATAL ERROR: MONGODB_URI environment variable is not set.");
    process.exit(1); // Exit if DB connection string is missing
}

// Middleware
app.use(express.json()); // Parse incoming JSON requests
app.use(express.urlencoded({ extended: true })); // Parse incoming URL-encoded requests
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files (HTML, CSS, JS) from 'public' directory

// API Routes
app.use('/api/departments', departmentRoutes);
app.use('/api/employees', employeeRoutes);

// Basic Frontend Route (Serve index.html for the root)
// Any request not caught by API routes or static files will be sent index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global Error Handler (Optional but Recommended)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});


// Connect to MongoDB and Start Server
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // useCreateIndex: true, // Not needed for Mongoose 6+
  // useFindAndModify: false // Not needed for Mongoose 6+
})
.then(() => {
  console.log('MongoDB Connected successfully.');
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1); // Exit if DB connection fails on startup
});