const vehicleRoutes = require("./routes/vehicle.routes");
app.use("/api/vehicles", vehicleRoutes);

const customerRoutes = require('./routes/customer.routes');
app.use('/api/customers', customerRoutes);

const parkingRoutes = require('./routes/parking.routes');
app.use('/api/parking', parkingRoutes);
