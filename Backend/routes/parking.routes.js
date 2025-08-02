const express = require('express');
const router = express.Router();
const parkingController = require('../controllers/parking.controller');

// --------- 📍 Parking Lots ---------
router.get('/lots', parkingController.getAllParkingLots);
router.get('/lots/:id', parkingController.getParkingLotById);

// --------- 🪧 Parking Spaces ---------
router.get('/spaces/lot/:lotId', parkingController.getSpacesByLotId);
router.get('/spaces/available', parkingController.getAvailableSpaces); // requires query params ?lot_id= &v_type_id=
router.post('/spaces/occupy', parkingController.occupySpace);
router.post('/spaces/free', parkingController.freeSpace);

// Optional CRUD for Parking Spaces (only if FEATURE_SPACES_CRUD=true)
router.get('/spaces', parkingController.getAllParkingSpaces);             // Optional
router.get('/spaces/:id', parkingController.getParkingSpaceById);        // Optional
router.delete('/spaces/:id', parkingController.deleteParkingSpace);      // Optional

// --------- 🚗 Entry/Exit Logs ---------
router.post('/entry', parkingController.logVehicleEntry);
router.post('/exit', parkingController.logVehicleExit);
router.get('/logs/active', parkingController.getActiveLogs);
router.get('/logs/vehicle/:license_plate', parkingController.getParkingHistory);

// Optional full logs access (only if FEATURE_LOG_RETRIEVAL=true)
router.get('/logs', parkingController.getAllLogs);                       // Optional
router.get('/logs/:id', parkingController.getLogById);                   // Optional
router.delete('/logs/:id', parkingController.deleteLog);                 // Optional

module.exports = router;
