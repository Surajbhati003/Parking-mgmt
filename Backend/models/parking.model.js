// const { time } = require('console');
// const db = require('../config/db.config');

// const ParkingModel = {
//     getAllParkingLots: (callback) => {
//         db.query('SELECT * FROM ParkingLots', callback);
//     },

//     getParkingLotById: (id, callback) => {
//         db.query('SELECT * FROM ParkingLots WHERE parking_lot_id = ?', [id], callback);
//     },




//     getAllParkingSpaces: (callback) => {
//         db.query('SELECT * FROM ParkingSpaces', callback);
//     },

//     getParkingSpaceById: (id, callback) => {
//         db.query('SELECT * FROM ParkingSpaces WHERE space_id = ?', [id], callback);
//     },



//     updateParkingSpace: (data, callback) => {

//         const { space_id, is_occupied } = data;
  
//         db.query(
//             'UPDATE ParkingSpaces SET is_occupied = ? WHERE space_id = ?',
//             [ is_occupied,space_id ],

//             callback
//         );
//     },

//     deleteParkingSpace: (id, callback) => {
//         db.query('DELETE FROM ParkingSpaces WHERE space_id = ?', [id], callback);
//     },

//     getAllVehicles: (callback) => {
//         db.query('SELECT * FROM Vehicles', callback);
//     },

//     getVehicleById: (id, callback) => {
//         db.query('SELECT * FROM Vehicles WHERE vehicle_id = ?', [id], callback);
//     },

//     createVehicle: (data, callback) => {
//         const { license_plate, owner_name, owner_contact, vehicle_type, hourly_rate,space_id } = data;
//         db.query(
//             'INSERT INTO Vehicles (license_plate, owner_name, owner_contact, vehicle_type, hourly_rate) VALUES (?, ?, ?, ?, ?)',
//             [license_plate, owner_name, owner_contact, vehicle_type, hourly_rate],
//             callback
//         );
//     },

//     updateVehicle: (id, data, callback) => {
//         const { license_plate, vehicle_type } = data;
//         db.query(
//             'UPDATE Vehicles SET license_plate = ?, vehicle_type = ? WHERE vehicle_id = ?',
//             [license_plate, vehicle_type, id],
//             callback
//         );
//     },

//     deleteVehicle: (id, callback) => {
//         db.query('DELETE FROM Vehicles WHERE vehicle_id = ?', [id], callback);
//     },

//     getAllLogs: (callback) => {
//         db.query('SELECT * FROM EntryExitLogs', callback);
//     },

//     getLogById: (id, callback) => {
//         db.query('SELECT * FROM EntryExitLogs WHERE log_id = ?', [id], callback);
//     },

//     createLog: (data, callback) => {
//         const { license_plate, space_id, entry_time } = data;
//         console.log("Data from controller:", license_plate, space_id, entry_time);
        
//         db.query(
//             'INSERT INTO EntryExitLogs (license_plate, space_id, entry_time) VALUES (?, ?, ?)',
//             [license_plate, space_id, entry_time],
//             callback
//         );
//     },
    
    

//    // Example model function to update log entry
//    updateLog: ({ license_plate, exit_time }, callback) => {
//     db.query(
//         'UPDATE EntryExitLogs SET exit_time = ? WHERE license_plate = ?',
//         [exit_time, license_plate],
//         (err, result) => {
//             if (err) {
//                 console.error('Error in updateLog:', err);
//                 callback(err, null);
//                 return;
//             }

//             // After updating the log, update the parking space
//             db.query(
//                 'UPDATE ParkingSpaces SET is_occupied = 0 WHERE space_id = (SELECT space_id FROM EntryExitLogs WHERE license_plate = ?)',
//                 [license_plate],
//                 (err, result) => {
//                     if (err) {
//                         console.error('Error in updating ParkingSpaces:', err);
//                         callback(err, null);
//                         return;
//                     }
//                     callback(null, result);
//                 }
//             );
//         }
//     );
// },

    

    

//     deleteLog: (id, callback) => {
//         db.query('DELETE FROM EntryExitLogs WHERE log_id = ?', [id], (err, results) => {
//             if (err) return callback(err);
//             // Also delete the vehicle entry when the log is deleted
//             db.query('DELETE FROM Vehicles WHERE vehicle_id = (SELECT vehicle_id FROM EntryExitLogs WHERE log_id = ?)', [id], callback);
//         });
//     },

//     getAvailableSpaces: (parking_lot_id, callback) => {
//         db.query('SELECT * FROM ParkingSpaces WHERE parking_lot_id = ? AND is_occupied = 0', [parking_lot_id], callback);
//     }
// };

// module.exports = ParkingModel;

//priyanshu code from here
// models/parking.model.js
// models/parking.model.js
const db = require('../config/db.config');

const ParkingModel = {
    // --------- 📍 Parking Lots ---------
    getAllLots: (callback) => {
        db.query('SELECT * FROM ParkingLots ORDER BY lot_id', callback);
    },

    getLotById: (id, callback) => {
        db.query('SELECT * FROM ParkingLots WHERE lot_id = ?', [id], callback);
    },

    // --------- 🪧 Parking Spaces ---------
    getAllParkingSpaces: (callback) => {
        db.query('SELECT * FROM ParkingSpaces ORDER BY space_id', callback);
    },

    getParkingSpaceById: (id, callback) => {
        db.query('SELECT * FROM ParkingSpaces WHERE space_id = ?', [id], callback);
    },

    getSpacesByLotId: (lot_id, callback) => {
        db.query('SELECT * FROM ParkingSpaces WHERE lot_id = ? ORDER BY space_id', [lot_id], callback);
    },

    getAvailableSpaces: (lot_id, v_type_id, callback) => {
        const query = `
            SELECT ps.*, vt.v_type_name, vt.hourly_rate 
            FROM ParkingSpaces ps 
            JOIN vehicle_type vt ON ps.v_type_id = vt.v_type_id
            WHERE ps.lot_id = ? 
            AND ps.v_type_id = ? 
            AND ps.is_occupied = 0
            ORDER BY ps.space_id
        `;
        db.query(query, [lot_id, v_type_id], callback);
    },

    occupySpace: (space_id, callback) => {
        db.query('UPDATE ParkingSpaces SET is_occupied = 1 WHERE space_id = ?', [space_id], callback);
    },

    freeSpace: (space_id, callback) => {
        db.query('UPDATE ParkingSpaces SET is_occupied = 0 WHERE space_id = ?', [space_id], callback);
    },

    updateParkingSpace: (data, callback) => {
        const { space_id, is_occupied } = data;
        db.query(
            'UPDATE ParkingSpaces SET is_occupied = ? WHERE space_id = ?',
            [is_occupied, space_id],
            callback
        );
    },

    deleteParkingSpace: (id, callback) => {
        db.query('DELETE FROM ParkingSpaces WHERE space_id = ?', [id], callback);
    },

    // --------- 🚗 Entry/Exit Logs ---------
    logEntry: (license_plate, space_id, callback) => {
        const entry_time = new Date();
        
        // First occupy the space
        db.query('UPDATE ParkingSpaces SET is_occupied = 1 WHERE space_id = ?', [space_id], (err) => {
            if (err) return callback(err);
            
            // Then log the entry
            db.query(
                'INSERT INTO EntryExitLogs (license_plate, space_id, entry_time, status) VALUES (?, ?, ?, "open")',
                [license_plate, space_id, entry_time],
                callback
            );
        });
    },

    logExit: (log_id, callback) => {
        const exit_time = new Date();
        
        // Get the space_id first
        db.query('SELECT space_id FROM EntryExitLogs WHERE log_id = ?', [log_id], (err, results) => {
            if (err) return callback(err);
            if (results.length === 0) return callback(new Error('Log not found'));
            
            const space_id = results[0].space_id;
            
            // Update the log with exit time and close status
            db.query('UPDATE EntryExitLogs SET exit_time = ?, status = "closed" WHERE log_id = ?', [exit_time, log_id], (err) => {
                if (err) return callback(err);
                
                // Free the space
                db.query('UPDATE ParkingSpaces SET is_occupied = 0 WHERE space_id = ?', [space_id], callback);
            });
        });
    },

    getParkingHistory: (license_plate, callback) => {
        const query = `
            SELECT 
                eel.log_id,
                eel.license_plate,
                eel.space_id,
                eel.entry_time,
                eel.exit_time,
                eel.status,
                ps.space_number,
                pl.name as lot_name,
                pl.location,
                vt.v_type_name,
                vt.hourly_rate
            FROM EntryExitLogs eel
            JOIN ParkingSpaces ps ON eel.space_id = ps.space_id
            JOIN ParkingLots pl ON ps.lot_id = pl.lot_id
            JOIN Vehicles v ON eel.license_plate = v.license_plate
            JOIN vehicle_type vt ON v.v_type_id = vt.v_type_id
            WHERE eel.license_plate = ?
            ORDER BY eel.entry_time DESC
        `;
        db.query(query, [license_plate], callback);
    },

    getActiveLogs: (callback) => {
        const query = `
            SELECT 
                eel.log_id,
                eel.license_plate,
                eel.space_id,
                eel.entry_time,
                eel.status,
                ps.space_number,
                pl.name as lot_name,
                pl.location,
                c.Name as customer_name,
                c.Phone as customer_phone,
                vt.v_type_name,
                vt.hourly_rate
            FROM EntryExitLogs eel
            JOIN ParkingSpaces ps ON eel.space_id = ps.space_id
            JOIN ParkingLots pl ON ps.lot_id = pl.lot_id
            JOIN Vehicles v ON eel.license_plate = v.license_plate
            JOIN Customers c ON v.customer_id = c.cust_id
            JOIN vehicle_type vt ON v.v_type_id = vt.v_type_id
            WHERE eel.status = 'open'
            ORDER BY eel.entry_time DESC
        `;
        db.query(query, callback);
    },

    getAllLogs: (callback) => {
        const query = `
            SELECT 
                eel.log_id,
                eel.license_plate,
                eel.space_id,
                eel.entry_time,
                eel.exit_time,
                eel.status,
                ps.space_number,
                pl.name as lot_name,
                c.Name as customer_name,
                vt.v_type_name,
                vt.hourly_rate
            FROM EntryExitLogs eel
            JOIN ParkingSpaces ps ON eel.space_id = ps.space_id
            JOIN ParkingLots pl ON ps.lot_id = pl.lot_id
            JOIN Vehicles v ON eel.license_plate = v.license_plate
            JOIN Customers c ON v.customer_id = c.cust_id
            JOIN vehicle_type vt ON v.v_type_id = vt.v_type_id
            ORDER BY eel.entry_time DESC
        `;
        db.query(query, callback);
    },

    getLogById: (id, callback) => {
        const query = `
            SELECT 
                eel.log_id,
                eel.license_plate,
                eel.space_id,
                eel.entry_time,
                eel.exit_time,
                eel.status,
                ps.space_number,
                pl.name as lot_name,
                c.Name as customer_name,
                vt.v_type_name,
                vt.hourly_rate
            FROM EntryExitLogs eel
            JOIN ParkingSpaces ps ON eel.space_id = ps.space_id
            JOIN ParkingLots pl ON ps.lot_id = pl.lot_id
            JOIN Vehicles v ON eel.license_plate = v.license_plate
            JOIN Customers c ON v.customer_id = c.cust_id
            JOIN vehicle_type vt ON v.v_type_id = vt.v_type_id
            WHERE eel.log_id = ?
        `;
        db.query(query, [id], callback);
    },

    deleteLog: (id, callback) => {
        // Get space_id before deleting
        db.query('SELECT space_id FROM EntryExitLogs WHERE log_id = ?', [id], (err, results) => {
            if (err) return callback(err);
            
            const space_id = results.length > 0 ? results[0].space_id : null;
            
            // Delete the log
            db.query('DELETE FROM EntryExitLogs WHERE log_id = ?', [id], (err, result) => {
                if (err) return callback(err);
                
                // Free the space if it was occupied
                if (space_id) {
                    db.query('UPDATE ParkingSpaces SET is_occupied = 0 WHERE space_id = ?', [space_id], callback);
                } else {
                    callback(null, result);
                }
            });
        });
    },

    // --------- 🚗 Vehicle Methods ---------
    getAllVehicles: (callback) => {
        const query = `
            SELECT 
                v.license_plate,
                v.customer_id,
                v.v_type_id,
                c.Name as customer_name,
                c.Phone as customer_phone,
                vt.v_type_name,
                vt.hourly_rate
            FROM Vehicles v
            JOIN Customers c ON v.customer_id = c.cust_id
            JOIN vehicle_type vt ON v.v_type_id = vt.v_type_id
            ORDER BY v.license_plate
        `;
        db.query(query, callback);
    },

    getVehicleByLicensePlate: (license_plate, callback) => {
        const query = `
            SELECT 
                v.license_plate,
                v.customer_id,
                v.v_type_id,
                c.Name as customer_name,
                c.Phone as customer_phone,
                vt.v_type_name,
                vt.hourly_rate
            FROM Vehicles v
            JOIN Customers c ON v.customer_id = c.cust_id
            JOIN vehicle_type vt ON v.v_type_id = vt.v_type_id
            WHERE v.license_plate = ?
        `;
        db.query(query, [license_plate], callback);
    },

    createVehicle: (data, callback) => {
        const { license_plate, customer_id, v_type_id } = data;
        db.query(
            'INSERT INTO Vehicles (license_plate, customer_id, v_type_id) VALUES (?, ?, ?)',
            [license_plate, customer_id, v_type_id],
            callback
        );
    },

    updateVehicle: (license_plate, data, callback) => {
        const { customer_id, v_type_id } = data;
        db.query(
            'UPDATE Vehicles SET customer_id = ?, v_type_id = ? WHERE license_plate = ?',
            [customer_id, v_type_id, license_plate],
            callback
        );
    },

    deleteVehicle: (license_plate, callback) => {
        db.query('DELETE FROM Vehicles WHERE license_plate = ?', [license_plate], callback);
    },

    // --------- 🚙 Vehicle Types ---------
    getAllVehicleTypes: (callback) => {
        db.query('SELECT * FROM vehicle_type ORDER BY v_type_id', callback);
    },

    getVehicleTypeById: (id, callback) => {
        db.query('SELECT * FROM vehicle_type WHERE v_type_id = ?', [id], callback);
    }
};

module.exports = ParkingModel;