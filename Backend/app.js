const express = require('express');
const cors = require('cors');
const db = require('./config/db.config'); // Import database configuration
// Import  routes
const customerRoutes = require('./routes/customer.routes');
const vehicleRoutes = require('./routes/vehicle.routes'); 
const parkingRoutes = require('./routes/parking.routes'); 
const analyticsRoutes = require('./routes/analytics.routes');
// Create Express application
const app = express();

// Test database connection
db.testConnection((err, results) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Connected to remote MySQL database successfully!', results);
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// Routes
app.use('/api/customers', customerRoutes);
app.use('/api/vehicles', vehicleRoutes); 
app.use('/api/parking', parkingRoutes); 
app.use('/api/analytics', analyticsRoutes)

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Parking Management API ' });
});

// 404 handler for unmatched routes
app.use((req, res, next) => {
  console.log(`Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error occurred:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} (All apis are prefixed with /api)`);
});

module.exports = app;