const { time } = require('console');
const db = require('../config/db.config');

const ParkingModel = {
    getAllParkingLots: (callback) => {
        db.query('SELECT * FROM ParkingLots', callback);
    },

    getParkingLotById: (id, callback) => {
        db.query('SELECT * FROM ParkingLots WHERE parking_lot_id = ?', [id], callback);
    },




    getAllParkingSpaces: (callback) => {
        db.query('SELECT * FROM ParkingSpaces', callback);
    },

    getParkingSpaceById: (id, callback) => {
        db.query('SELECT * FROM ParkingSpaces WHERE space_id = ?', [id], callback);
    },



    updateParkingSpace: (data, callback) => {

        const { space_id, is_occupied } = data;
  
        db.query(
            'UPDATE ParkingSpaces SET is_occupied = ? WHERE space_id = ?',
            [ is_occupied,space_id ],

            callback
        );
    },

    deleteParkingSpace: (id, callback) => {
        db.query('DELETE FROM ParkingSpaces WHERE space_id = ?', [id], callback);
    },

    getAllVehicles: (callback) => {
        db.query('SELECT * FROM Vehicles', callback);
    },

    getVehicleById: (id, callback) => {
        db.query('SELECT * FROM Vehicles WHERE vehicle_id = ?', [id], callback);
    },

    createVehicle: (data, callback) => {
        const { license_plate, owner_name, owner_contact, vehicle_type, hourly_rate,space_id } = data;
        db.query(
            'INSERT INTO Vehicles (license_plate, owner_name, owner_contact, vehicle_type, hourly_rate) VALUES (?, ?, ?, ?, ?)',
            [license_plate, owner_name, owner_contact, vehicle_type, hourly_rate],
            callback
        );
    },

    updateVehicle: (id, data, callback) => {
        const { license_plate, vehicle_type } = data;
        db.query(
            'UPDATE Vehicles SET license_plate = ?, vehicle_type = ? WHERE vehicle_id = ?',
            [license_plate, vehicle_type, id],
            callback
        );
    },

    deleteVehicle: (id, callback) => {
        db.query('DELETE FROM Vehicles WHERE vehicle_id = ?', [id], callback);
    },

    getAllLogs: (callback) => {
        db.query('SELECT * FROM EntryExitLogs', callback);
    },

    getLogById: (id, callback) => {
        db.query('SELECT * FROM EntryExitLogs WHERE log_id = ?', [id], callback);
    },

    createLog: (data, callback) => {
        const { license_plate, space_id, entry_time } = data;
        console.log("Data from controller:", license_plate, space_id, entry_time);
        
        db.query(
            'INSERT INTO EntryExitLogs (license_plate, space_id, entry_time) VALUES (?, ?, ?)',
            [license_plate, space_id, entry_time],
            callback
        );
    },
    
    

   // Example model function to update log entry
   updateLog: ({ license_plate, exit_time }, callback) => {
    db.query(
        'UPDATE EntryExitLogs SET exit_time = ? WHERE license_plate = ?',
        [exit_time, license_plate],
        (err, result) => {
            if (err) {
                console.error('Error in updateLog:', err);
                callback(err, null);
                return;
            }

            // After updating the log, update the parking space
            db.query(
                'UPDATE ParkingSpaces SET is_occupied = 0 WHERE space_id = (SELECT space_id FROM EntryExitLogs WHERE license_plate = ?)',
                [license_plate],
                (err, result) => {
                    if (err) {
                        console.error('Error in updating ParkingSpaces:', err);
                        callback(err, null);
                        return;
                    }
                    callback(null, result);
                }
            );
        }
    );
},

    

    

    deleteLog: (id, callback) => {
        db.query('DELETE FROM EntryExitLogs WHERE log_id = ?', [id], (err, results) => {
            if (err) return callback(err);
            // Also delete the vehicle entry when the log is deleted
            db.query('DELETE FROM Vehicles WHERE vehicle_id = (SELECT vehicle_id FROM EntryExitLogs WHERE log_id = ?)', [id], callback);
        });
    },

    getAvailableSpaces: (parking_lot_id, callback) => {
        db.query('SELECT * FROM ParkingSpaces WHERE parking_lot_id = ? AND is_occupied = 0', [parking_lot_id], callback);
    }
};

module.exports = ParkingModel;
