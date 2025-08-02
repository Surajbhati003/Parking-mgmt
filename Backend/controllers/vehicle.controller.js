// controllers/vehicle.controller.js
const db = require("../models");
const Vehicle = db.Vehicle;

// Create a new vehicle
exports.createVehicle = async (req, res) => {
  try {
    const { license_plate, customer_id, v_type_id } = req.body;
    const vehicle = await Vehicle.create({ license_plate, customer_id, v_type_id });
    res.status(201).json(vehicle);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all vehicles
exports.getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.findAll();
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get vehicle by license plate
exports.getVehicleByPlate = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.plate);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all vehicles by customer ID
exports.getVehiclesByCustomer = async (req, res) => {
  try {
    const vehicles = await Vehicle.findAll({ where: { customer_id: req.params.customerId } });
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a vehicle (vehicle type)
exports.updateVehicle = async (req, res) => {
  try {
    const { v_type_id } = req.body;
    const updated = await Vehicle.update(
      { v_type_id },
      { where: { license_plate: req.params.plate } }
    );
    if (updated[0] === 0) return res.status(404).json({ message: "Vehicle not found" });
    res.json({ message: "Vehicle updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a vehicle
exports.deleteVehicle = async (req, res) => {
  try {
    const deleted = await Vehicle.destroy({ where: { license_plate: req.params.plate } });
    if (deleted === 0) return res.status(404).json({ message: "Vehicle not found" });
    res.json({ message: "Vehicle deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
