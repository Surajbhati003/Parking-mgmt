// const Parking = require('../models/parking.model');

// // --------- 📍 Parking Lots ---------

// exports.getAllParkingLots = (req, res) => {
//   Parking.getAllLots((err, lots) => {
//     if (err) return res.status(500).json({ error: err.message });
//     res.json(lots);
//   });
// };

// exports.getParkingLotById = (req, res) => {
//   const id = req.params.id;
//   Parking.getLotById(id, (err, lot) => {
//     if (err) return res.status(500).json({ error: err.message });
//     if (!lot.length) return res.status(404).json({ message: 'Parking lot not found' });
//     res.json(lot[0]);
//   });
// };

// // --------- 🪧 Parking Spaces ---------

// exports.getSpacesByLotId = (req, res) => {
//   const lot_id = req.params.lotId;
//   Parking.getSpacesByLotId(lot_id, (err, spaces) => {
//     if (err) return res.status(500).json({ error: err.message });
//     res.json(spaces);
//   });
// };

// exports.getAvailableSpaces = (req, res) => {
//   const { lot_id, v_type_id } = req.query;
//   if (!lot_id || !v_type_id) return res.status(400).json({ message: 'lot_id and v_type_id are required' });

//   Parking.getAvailableSpaces(lot_id, v_type_id, (err, spaces) => {
//     if (err) return res.status(500).json({ error: err.message });
//     res.json(spaces);
//   });
// };

// exports.occupySpace = (req, res) => {
//   const { space_id } = req.body;
//   Parking.occupySpace(space_id, (err, result) => {
//     if (err) return res.status(500).json({ error: err.message });
//     res.json({ message: 'Space marked as occupied' });
//   });
// };

// exports.freeSpace = (req, res) => {
//   const { space_id } = req.body;
//   Parking.freeSpace(space_id, (err, result) => {
//     if (err) return res.status(500).json({ error: err.message });
//     res.json({ message: 'Space marked as free' });
//   });
// };

// // --------- 🚗 Entry/Exit Logs ---------

// exports.logVehicleEntry = (req, res) => {
//   const { license_plate, space_id } = req.body;
//   if (!license_plate || !space_id) return res.status(400).json({ message: 'license_plate and space_id required' });

//   Parking.logEntry(license_plate, space_id, (err, result) => {
//     if (err) return res.status(500).json({ error: err.message });
//     res.status(201).json({ message: 'Vehicle entry logged', log_id: result.insertId });
//   });
// };

// exports.logVehicleExit = (req, res) => {
//   const { log_id } = req.body;
//   if (!log_id) return res.status(400).json({ message: 'log_id required' });

//   Parking.logExit(log_id, (err, result) => {
//     if (err) return res.status(500).json({ error: err.message });
//     res.json({ message: 'Vehicle exit logged and space freed (if enabled)' });
//   });
// };

// exports.getParkingHistory = (req, res) => {
//   const { license_plate } = req.params;

//   Parking.getParkingHistory(license_plate, (err, logs) => {
//     if (err) return res.status(500).json({ error: err.message });
//     res.json(logs);
//   });
// };

// exports.getActiveLogs = (req, res) => {
//   Parking.getActiveLogs((err, logs) => {
//     if (err) return res.status(500).json({ error: err.message });
//     res.json(logs);
//   });
// };

// // --------- Optional: CRUD for ParkingSpaces ---------

// exports.getAllParkingSpaces = (req, res) => {
//   if (!Parking.getAllParkingSpaces) return res.status(403).json({ message: 'Not enabled' });
//   Parking.getAllParkingSpaces((err, rows) => {
//     if (err) return res.status(500).json({ error: err.message });
//     res.json(rows);
//   });
// };

// exports.getParkingSpaceById = (req, res) => {
//   const id = req.params.id;
//   if (!Parking.getParkingSpaceById) return res.status(403).json({ message: 'Not enabled' });

//   Parking.getParkingSpaceById(id, (err, row) => {
//     if (err) return res.status(500).json({ error: err.message });
//     if (!row.length) return res.status(404).json({ message: 'Space not found' });
//     res.json(row[0]);
//   });
// };

// exports.deleteParkingSpace = (req, res) => {
//   const id = req.params.id;
//   if (!Parking.deleteParkingSpace) return res.status(403).json({ message: 'Not enabled' });

//   Parking.deleteParkingSpace(id, (err) => {
//     if (err) return res.status(500).json({ error: err.message });
//     res.json({ message: 'Space deleted' });
//   });
// };

// // --------- Optional: EntryExitLogs full retrieval ---------

// exports.getAllLogs = (req, res) => {
//   if (!Parking.getAllLogs) return res.status(403).json({ message: 'Not enabled' });
//   Parking.getAllLogs((err, logs) => {
//     if (err) return res.status(500).json({ error: err.message });
//     res.json(logs);
//   });
// };

// exports.getLogById = (req, res) => {
//   const id = req.params.id;
//   if (!Parking.getLogById) return res.status(403).json({ message: 'Not enabled' });

//   Parking.getLogById(id, (err, row) => {
//     if (err) return res.status(500).json({ error: err.message });
//     if (!row.length) return res.status(404).json({ message: 'Log not found' });
//     res.json(row[0]);
//   });
// };

// exports.deleteLog = (req, res) => {
//   const id = req.params.id;
//   if (!Parking.deleteLog) return res.status(403).json({ message: 'Not enabled' });

//   Parking.deleteLog(id, (err) => {
//     if (err) return res.status(500).json({ error: err.message });
//     res.json({ message: 'Log deleted' });
//   });
// };
//priyanshu code from here
const Parking = require('../models/parking.model');

// --------- 📍 Parking Lots ---------

exports.getAllParkingLots = (req, res) => {
  Parking.getAllLots((err, lots) => {
    if (err) {
      console.error('Error getting parking lots:', err);
      return res.status(500).json({ 
        success: false, 
        error: err.message 
      });
    }
    res.json({
      success: true,
      message: 'Parking lots retrieved successfully',
      data: lots,
      count: lots.length
    });
  });
};

exports.getParkingLotById = (req, res) => {
  const id = req.params.id;
  Parking.getLotById(id, (err, lot) => {
    if (err) {
      console.error('Error getting parking lot:', err);
      return res.status(500).json({ 
        success: false, 
        error: err.message 
      });
    }
    if (!lot.length) {
      return res.status(404).json({ 
        success: false, 
        message: 'Parking lot not found' 
      });
    }
    res.json({
      success: true,
      message: 'Parking lot retrieved successfully',
      data: lot[0]
    });
  });
};

// --------- 🪧 Parking Spaces ---------

exports.getSpacesByLotId = (req, res) => {
  const lot_id = req.params.lotId;
  Parking.getSpacesByLotId(lot_id, (err, spaces) => {
    if (err) {
      console.error('Error getting spaces by lot:', err);
      return res.status(500).json({ 
        success: false, 
        error: err.message 
      });
    }
    res.json({
      success: true,
      message: 'Parking spaces retrieved successfully',
      data: spaces,
      count: spaces.length
    });
  });
};

exports.getAvailableSpaces = (req, res) => {
  const { lot_id, v_type_id } = req.query;
  if (!lot_id || !v_type_id) {
    return res.status(400).json({ 
      success: false, 
      message: 'lot_id and v_type_id are required as query parameters' 
    });
  }

  Parking.getAvailableSpaces(lot_id, v_type_id, (err, spaces) => {
    if (err) {
      console.error('Error getting available spaces:', err);
      return res.status(500).json({ 
        success: false, 
        error: err.message 
      });
    }
    res.json({
      success: true,
      message: 'Available spaces retrieved successfully',
      data: spaces,
      count: spaces.length
    });
  });
};

exports.occupySpace = (req, res) => {
  const { space_id } = req.body;
  if (!space_id) {
    return res.status(400).json({
      success: false,
      message: 'space_id is required'
    });
  }

  Parking.occupySpace(space_id, (err, result) => {
    if (err) {
      console.error('Error occupying space:', err);
      return res.status(500).json({ 
        success: false, 
        error: err.message 
      });
    }
    res.json({ 
      success: true,
      message: 'Space marked as occupied',
      data: { space_id, is_occupied: true }
    });
  });
};

exports.freeSpace = (req, res) => {
  const { space_id } = req.body;
  if (!space_id) {
    return res.status(400).json({
      success: false,
      message: 'space_id is required'
    });
  }

  Parking.freeSpace(space_id, (err, result) => {
    if (err) {
      console.error('Error freeing space:', err);
      return res.status(500).json({ 
        success: false, 
        error: err.message 
      });
    }
    res.json({ 
      success: true,
      message: 'Space marked as free',
      data: { space_id, is_occupied: false }
    });
  });
};

// --------- 🚗 Entry/Exit Logs ---------

exports.logVehicleEntry = (req, res) => {
  const { license_plate, space_id } = req.body;
  if (!license_plate || !space_id) {
    return res.status(400).json({ 
      success: false, 
      message: 'license_plate and space_id are required' 
    });
  }

  // First check if vehicle exists
  Parking.getVehicleByLicensePlate(license_plate, (err, vehicle) => {
    if (err) {
      console.error('Error checking vehicle:', err);
      return res.status(500).json({ 
        success: false, 
        error: err.message 
      });
    }
    if (!vehicle.length) {
      return res.status(404).json({ 
        success: false, 
        message: 'Vehicle not found. Please register the vehicle first.' 
      });
    }

    // Check if space is available
    Parking.getParkingSpaceById(space_id, (err, space) => {
      if (err) {
        console.error('Error checking space:', err);
        return res.status(500).json({ 
          success: false, 
          error: err.message 
        });
      }
      if (!space.length) {
        return res.status(404).json({ 
          success: false, 
          message: 'Parking space not found' 
        });
      }
      if (space[0].is_occupied) {
        return res.status(400).json({ 
          success: false, 
          message: 'Parking space is already occupied' 
        });
      }

      // Log entry
      Parking.logEntry(license_plate, space_id, (err, result) => {
        if (err) {
          console.error('Error logging vehicle entry:', err);
          return res.status(500).json({ 
            success: false, 
            error: err.message 
          });
        }
        res.status(201).json({ 
          success: true,
          message: 'Vehicle entry logged successfully', 
          data: {
            log_id: result.insertId,
            license_plate,
            space_id
          }
        });
      });
    });
  });
};

exports.logVehicleExit = (req, res) => {
  const { log_id } = req.body;
  if (!log_id) {
    return res.status(400).json({ 
      success: false, 
      message: 'log_id is required' 
    });
  }

  // First check if log exists and is open
  Parking.getLogById(log_id, (err, log) => {
    if (err) {
      console.error('Error checking log:', err);
      return res.status(500).json({ 
        success: false, 
        error: err.message 
      });
    }
    if (!log.length) {
      return res.status(404).json({ 
        success: false, 
        message: 'Log not found' 
      });
    }
    if (log[0].status === 'closed') {
      return res.status(400).json({ 
        success: false, 
        message: 'This log is already closed' 
      });
    }

    Parking.logExit(log_id, (err, result) => {
      if (err) {
        console.error('Error logging vehicle exit:', err);
        return res.status(500).json({ 
          success: false, 
          error: err.message 
        });
      }
      res.json({ 
        success: true,
        message: 'Vehicle exit logged and space freed successfully',
        data: { log_id }
      });
    });
  });
};

exports.getParkingHistory = (req, res) => {
  const { license_plate } = req.params;

  Parking.getParkingHistory(license_plate, (err, logs) => {
    if (err) {
      console.error('Error getting parking history:', err);
      return res.status(500).json({ 
        success: false, 
        error: err.message 
      });
    }
    res.json({
      success: true,
      message: 'Parking history retrieved successfully',
      data: logs,
      count: logs.length
    });
  });
};

exports.getActiveLogs = (req, res) => {
  Parking.getActiveLogs((err, logs) => {
    if (err) {
      console.error('Error getting active logs:', err);
      return res.status(500).json({ 
        success: false, 
        error: err.message 
      });
    }
    res.json({
      success: true,
      message: 'Active parking logs retrieved successfully',
      data: logs,
      count: logs.length
    });
  });
};

// --------- 🚗 Vehicle Management ---------

exports.getAllVehicles = (req, res) => {
  Parking.getAllVehicles((err, vehicles) => {
    if (err) {
      console.error('Error getting vehicles:', err);
      return res.status(500).json({ 
        success: false, 
        error: err.message 
      });
    }
    res.json({
      success: true,
      message: 'Vehicles retrieved successfully',
      data: vehicles,
      count: vehicles.length
    });
  });
};

exports.getVehicleByLicensePlate = (req, res) => {
  const { license_plate } = req.params;

  Parking.getVehicleByLicensePlate(license_plate, (err, vehicle) => {
    if (err) {
      console.error('Error getting vehicle:', err);
      return res.status(500).json({ 
        success: false, 
        error: err.message 
      });
    }
    if (!vehicle.length) {
      return res.status(404).json({ 
        success: false, 
        message: 'Vehicle not found' 
      });
    }
    res.json({
      success: true,
      message: 'Vehicle retrieved successfully',
      data: vehicle[0]
    });
  });
};

exports.createVehicle = (req, res) => {
  const { license_plate, customer_id, v_type_id } = req.body;
  
  if (!license_plate || !customer_id || !v_type_id) {
    return res.status(400).json({
      success: false,
      message: 'license_plate, customer_id, and v_type_id are required'
    });
  }

  Parking.createVehicle({ license_plate, customer_id, v_type_id }, (err, result) => {
    if (err) {
      console.error('Error creating vehicle:', err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          success: false,
          message: 'Vehicle with this license plate already exists'
        });
      }
      return res.status(500).json({ 
        success: false, 
        error: err.message 
      });
    }
    res.status(201).json({
      success: true,
      message: 'Vehicle created successfully',
      data: { license_plate, customer_id, v_type_id }
    });
  });
};

exports.updateVehicle = (req, res) => {
  const { license_plate } = req.params;
  const { v_type_id } = req.body;

  if (!v_type_id) {
    return res.status(400).json({
      success: false,
      message: 'v_type_id is required'
    });
  }

  Parking.updateVehicle(license_plate, v_type_id, (err, result) => {
    if (err) {
      console.error('Error updating vehicle:', err);
      return res.status(500).json({ 
        success: false, 
        error: err.message 
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    res.json({
      success: true,
      message: 'Vehicle updated successfully',
      data: { license_plate, v_type_id }
    });
  });
};


exports.deleteVehicle = (req, res) => {
  const { license_plate } = req.params;

  Parking.deleteVehicle(license_plate, (err, result) => {
    if (err) {
      console.error('Error deleting vehicle:', err);
      return res.status(500).json({ 
        success: false, 
        error: err.message 
      });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }
    res.json({
      success: true,
      message: 'Vehicle deleted successfully'
    });
  });
};

// --------- 🚙 Vehicle Types ---------

exports.getAllVehicleTypes = (req, res) => {
  Parking.getAllVehicleTypes((err, types) => {
    if (err) {
      console.error('Error getting vehicle types:', err);
      return res.status(500).json({ 
        success: false, 
        error: err.message 
      });
    }
    res.json({
      success: true,
      message: 'Vehicle types retrieved successfully',
      data: types,
      count: types.length
    });
  });
};

exports.getVehicleTypeById = (req, res) => {
  const id = req.params.id;

  Parking.getVehicleTypeById(id, (err, type) => {
    if (err) {
      console.error('Error getting vehicle type:', err);
      return res.status(500).json({ 
        success: false, 
        error: err.message 
      });
    }
    if (!type.length) {
      return res.status(404).json({ 
        success: false, 
        message: 'Vehicle type not found' 
      });
    }
    res.json({
      success: true,
      message: 'Vehicle type retrieved successfully',
      data: type[0]
    });
  });
};

// --------- Optional: CRUD for ParkingSpaces ---------

exports.getAllParkingSpaces = (req, res) => {
  Parking.getAllParkingSpaces((err, rows) => {
    if (err) {
      console.error('Error getting all parking spaces:', err);
      return res.status(500).json({ 
        success: false, 
        error: err.message 
      });
    }
    res.json({
      success: true,
      message: 'All parking spaces retrieved successfully',
      data: rows,
      count: rows.length
    });
  });
};

exports.getParkingSpaceById = (req, res) => {
  const id = req.params.id;

  Parking.getParkingSpaceById(id, (err, row) => {
    if (err) {
      console.error('Error getting parking space:', err);
      return res.status(500).json({ 
        success: false, 
        error: err.message 
      });
    }
    if (!row.length) {
      return res.status(404).json({ 
        success: false, 
        message: 'Parking space not found' 
      });
    }
    res.json({
      success: true,
      message: 'Parking space retrieved successfully',
      data: row[0]
    });
  });
};

exports.deleteParkingSpace = (req, res) => {
  const id = req.params.id;

  Parking.deleteParkingSpace(id, (err) => {
    if (err) {
      console.error('Error deleting parking space:', err);
      return res.status(500).json({ 
        success: false, 
        error: err.message 
      });
    }
    res.json({ 
      success: true,
      message: 'Parking space deleted successfully' 
    });
  });
};

// --------- Optional: EntryExitLogs full retrieval ---------

exports.getAllLogs = (req, res) => {
  Parking.getAllLogs((err, logs) => {
    if (err) {
      console.error('Error getting all logs:', err);
      return res.status(500).json({ 
        success: false, 
        error: err.message 
      });
    }
    res.json({
      success: true,
      message: 'All parking logs retrieved successfully',
      data: logs,
      count: logs.length
    });
  });
};

exports.getLogById = (req, res) => {
  const id = req.params.id;

  Parking.getLogById(id, (err, row) => {
    if (err) {
      console.error('Error getting log:', err);
      return res.status(500).json({ 
        success: false, 
        error: err.message 
      });
    }
    if (!row.length) {
      return res.status(404).json({ 
        success: false, 
        message: 'Log not found' 
      });
    }
    res.json({
      success: true,
      message: 'Log retrieved successfully',
      data: row[0]
    });
  });
};

exports.deleteLog = (req, res) => {
  const id = req.params.id;

  Parking.deleteLog(id, (err) => {
    if (err) {
      console.error('Error deleting log:', err);
      return res.status(500).json({ 
        success: false, 
        error: err.message 
      });
    }
    res.json({ 
      success: true,
      message: 'Log deleted successfully' 
    });
  });
};