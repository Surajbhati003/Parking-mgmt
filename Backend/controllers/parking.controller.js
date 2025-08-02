const Parking = require('../models/parking.model');

// --------- 📍 Parking Lots ---------

exports.getAllParkingLots = (req, res) => {
  Parking.getAllLots((err, lots) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(lots);
  });
};

exports.getParkingLotById = (req, res) => {
  const id = req.params.id;
  Parking.getLotById(id, (err, lot) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!lot.length) return res.status(404).json({ message: 'Parking lot not found' });
    res.json(lot[0]);
  });
};

// --------- 🪧 Parking Spaces ---------

exports.getSpacesByLotId = (req, res) => {
  const lot_id = req.params.lotId;
  Parking.getSpacesByLotId(lot_id, (err, spaces) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(spaces);
  });
};

exports.getAvailableSpaces = (req, res) => {
  const { lot_id, v_type_id } = req.query;
  if (!lot_id || !v_type_id) return res.status(400).json({ message: 'lot_id and v_type_id are required' });

  Parking.getAvailableSpaces(lot_id, v_type_id, (err, spaces) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(spaces);
  });
};

exports.occupySpace = (req, res) => {
  const { space_id } = req.body;
  Parking.occupySpace(space_id, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Space marked as occupied' });
  });
};

exports.freeSpace = (req, res) => {
  const { space_id } = req.body;
  Parking.freeSpace(space_id, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Space marked as free' });
  });
};

// --------- 🚗 Entry/Exit Logs ---------

exports.logVehicleEntry = (req, res) => {
  const { license_plate, space_id } = req.body;
  if (!license_plate || !space_id) return res.status(400).json({ message: 'license_plate and space_id required' });

  Parking.logEntry(license_plate, space_id, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Vehicle entry logged', log_id: result.insertId });
  });
};

exports.logVehicleExit = (req, res) => {
  const { log_id } = req.body;
  if (!log_id) return res.status(400).json({ message: 'log_id required' });

  Parking.logExit(log_id, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Vehicle exit logged and space freed (if enabled)' });
  });
};

exports.getParkingHistory = (req, res) => {
  const { license_plate } = req.params;

  Parking.getParkingHistory(license_plate, (err, logs) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(logs);
  });
};

exports.getActiveLogs = (req, res) => {
  Parking.getActiveLogs((err, logs) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(logs);
  });
};

// --------- Optional: CRUD for ParkingSpaces ---------

exports.getAllParkingSpaces = (req, res) => {
  if (!Parking.getAllParkingSpaces) return res.status(403).json({ message: 'Not enabled' });
  Parking.getAllParkingSpaces((err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

exports.getParkingSpaceById = (req, res) => {
  const id = req.params.id;
  if (!Parking.getParkingSpaceById) return res.status(403).json({ message: 'Not enabled' });

  Parking.getParkingSpaceById(id, (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row.length) return res.status(404).json({ message: 'Space not found' });
    res.json(row[0]);
  });
};

exports.deleteParkingSpace = (req, res) => {
  const id = req.params.id;
  if (!Parking.deleteParkingSpace) return res.status(403).json({ message: 'Not enabled' });

  Parking.deleteParkingSpace(id, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Space deleted' });
  });
};

// --------- Optional: EntryExitLogs full retrieval ---------

exports.getAllLogs = (req, res) => {
  if (!Parking.getAllLogs) return res.status(403).json({ message: 'Not enabled' });
  Parking.getAllLogs((err, logs) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(logs);
  });
};

exports.getLogById = (req, res) => {
  const id = req.params.id;
  if (!Parking.getLogById) return res.status(403).json({ message: 'Not enabled' });

  Parking.getLogById(id, (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row.length) return res.status(404).json({ message: 'Log not found' });
    res.json(row[0]);
  });
};

exports.deleteLog = (req, res) => {
  const id = req.params.id;
  if (!Parking.deleteLog) return res.status(403).json({ message: 'Not enabled' });

  Parking.deleteLog(id, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Log deleted' });
  });
};
