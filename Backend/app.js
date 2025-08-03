
const express = require('express');
const cors = require('cors');
const db = require('./config/db.config'); // Import database configuration
// Import only the customer routes
const customerRoutes = require('./routes/customer.routes');

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

// Only customer routes
app.use('/api/customers', customerRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Parking Management API (Customers Only)' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} (Customers API only)`);
});

module.exports = app;