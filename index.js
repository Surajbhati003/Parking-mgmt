const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');


const app = express();
app.use(express.json());
const port = 3000;

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'views')));

// Import routes
const parkingRoutes = require('./routes/parking.routes');
app.use('/api', parkingRoutes);

// Serve the index.html file as the default landing page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
