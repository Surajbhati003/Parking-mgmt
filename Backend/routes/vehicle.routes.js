// routes/vehicle.routes.js
const express = require("express");
const router = express.Router();
const vehicleController = require("../controllers/vehicle.controller");

// POST: Add new vehicle
router.post("/", vehicleController.createVehicle);

// GET: All vehicles
router.get("/", vehicleController.getAllVehicles);

// GET: Vehicle by license plate
router.get("/:plate", vehicleController.getVehicleByPlate);

// GET: All vehicles by customer ID
router.get("/customer/:customerId", vehicleController.getVehiclesByCustomer);

// PUT: Update vehicle type
router.put("/:plate", vehicleController.updateVehicle);

// DELETE: Remove a vehicle
router.delete("/:plate", vehicleController.deleteVehicle);

module.exports = router;
