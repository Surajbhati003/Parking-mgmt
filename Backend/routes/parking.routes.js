const express = require('express');
const router = express.Router();
const ParkingController = require('../controllers/parking.controller');

// ParkingLots routes
router.get('/parking-lots', ParkingController.getAllParkingLots);
router.get('/parking-lots/:id', ParkingController.getParkingLotById);

// ParkingSpaces routes
router.get('/parking-spaces', ParkingController.getAllParkingSpaces);
router.get('/parking-spaces/:id', ParkingController.getParkingSpaceById);
router.post('/parking-spaces', ParkingController.createParkingSpace);
router.put('/update-parking-spaces', ParkingController.updateParkingSpace);
router.delete('/parking-spaces/:id', ParkingController.deleteParkingSpace);

// Vehicles routes
router.get('/allvehicles', ParkingController.getAllVehicles);
router.get('/vehicles/:id', ParkingController.getVehicleById);
router.post('/vehicles', ParkingController.createVehicle); // Corrected route
router.delete('/vehicles/:id', ParkingController.deleteVehicle);

// EntryExitLogs routes
router.get('/logs', ParkingController.getAllLogs);
router.get('/logs/:id', ParkingController.getLogById);
router.post('/logs', ParkingController.createLog);
router.put('/logs', ParkingController.updateLog);
router.delete('/logs/:id', ParkingController.deleteLog);

// Available spaces route
router.get('/available-spaces/:parking_lot_id', ParkingController.getAvailableSpaces);

module.exports = router;
