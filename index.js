const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')));

// Views route for frontend HTML
app.use(express.static(path.join(__dirname, 'views')));

// Route imports
const parkingRoutes = require('./Backend/routes/parking.routes.js');
const customerRoutes = require('./Backend/routes/customer.routes');
const vehicleRoutes = require('./Backend/routes/vehicle.routes');

// Route mounting
app.use('/api/parking', parkingRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/vehicles', vehicleRoutes);

// Default landing page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Server start
app.listen(port, () => {
    console.log(`🚗 Server running at: http://localhost:${port}`);
});
