const db = require('../config/db.config');

const VehicleModel = {
  // Get all vehicles
  getAll: (callback) => {
    db.query('SELECT * FROM Vehicles', callback);
  },

  // Get a vehicle by license plate
  getVehicleById: (license_plate, callback) => {
    db.query('SELECT * FROM Vehicles WHERE license_plate = ?', [license_plate], callback);
  },

  // Get vehicles by customer ID
  getByCustomerId: (customer_id, callback) => {
    db.query('SELECT * FROM Vehicles WHERE customer_id = ?', [customer_id], callback);
  },

  // Add a new vehicle
  create: (vehicleData, callback) => {
    const { license_plate, customer_id, v_type_id } = vehicleData;
    db.query(
      'INSERT INTO Vehicles (license_plate, customer_id, v_type_id) VALUES (?, ?, ?)',
      [license_plate, customer_id, v_type_id],
      callback
    );
  },

  // Update vehicle type
  update: (license_plate, v_type_id, callback) => {
    db.query(
      'UPDATE Vehicles SET v_type_id = ? WHERE license_plate = ?',
      [v_type_id, license_plate],
      callback
    );
  },

  // Delete a vehicle
  delete: (license_plate, callback) => {
    db.query('DELETE FROM Vehicles WHERE license_plate = ?', [license_plate], callback);
  }
};

module.exports = VehicleModel;
