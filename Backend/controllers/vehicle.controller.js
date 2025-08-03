const Vehicle = require('../models/vehicle.model');

// Create a new vehicle
exports.createVehicle = (req, res) => {
  const { license_plate, customer_id, v_type_id } = req.body;
  
  // Input validation
  if (!license_plate || !customer_id || !v_type_id) {
    return res.status(400).json({ 
      error: 'Missing required fields: license_plate, customer_id, and v_type_id are required' 
    });
  }

  Vehicle.create({ license_plate, customer_id, v_type_id }, (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ 
      message: 'Vehicle created successfully', 
      data: { 
        license_plate, 
        customer_id, 
        v_type_id,
        insertId: result.insertId 
      } 
    });
  });
};

// Get all vehicles
exports.getAllVehicles = (req, res) => {
  Vehicle.getAll((err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
};

// Get vehicle by license plate
exports.getVehicleByPlate = (req, res) => {
  const plate = req.params.plate;
  
  if (!plate) {
    return res.status(400).json({ error: 'License plate parameter is required' });
  }

  Vehicle.getVehicleById(plate, (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: err.message });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "Vehicle not found" });
    }
    res.json(result[0]);
  });
};

// Get all vehicles by customer ID
exports.getVehiclesByCustomer = (req, res) => {
  const customerId = req.params.customerId;
  
  if (!customerId) {
    return res.status(400).json({ error: 'Customer ID parameter is required' });
  }

  Vehicle.getByCustomerId(customerId, (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
};

// Update vehicle
exports.updateVehicle = (req, res) => {
  const { v_type_id } = req.body;
  const plate = req.params.plate;
  
  if (!v_type_id) {
    return res.status(400).json({ error: 'v_type_id is required' });
  }
  
  if (!plate) {
    return res.status(400).json({ error: 'License plate parameter is required' });
  }

  Vehicle.update(plate, v_type_id, (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Vehicle not found" });
    }
    res.json({ message: "Vehicle updated successfully" });
  });
};

// Delete vehicle
exports.deleteVehicle = (req, res) => {
  const plate = req.params.plate;
  
  if (!plate) {
    return res.status(400).json({ error: 'License plate parameter is required' });
  }

  Vehicle.delete(plate, (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Vehicle not found" });
    }
    res.json({ message: "Vehicle deleted successfully" });
  });
};