const ParkingModel = require('../models/parking.model');

const ParkingController = {
    getAllParkingLots: (req, res) => {
        ParkingModel.getAllParkingLots((err, results) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            res.json(results);
        });
    },

    getParkingLotById: (req, res) => {
        const lotId = req.params.id;
        ParkingModel.getParkingLotById(lotId, (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            if (!result) {
                res.status(404).json({ error: `Parking lot with id ${lotId} not found` });
                return;
            }
            res.json(result);
        });
    },

    getAllParkingSpaces: (req, res) => {
        ParkingModel.getAllParkingSpaces((err, results) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            res.json(results);
        });
    },

    getParkingSpaceById: (req, res) => {
        const spaceId = req.params.id;
        ParkingModel.getParkingSpaceById(spaceId, (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            if (!result) {
                res.status(404).json({ error: `Parking space with id ${spaceId} not found` });
                return;
            }
            res.json(result);
        });
    },

    createParkingSpace: (req, res) => {
        const { lot_id, status } = req.body;
        ParkingModel.createParkingSpace(lot_id, status, (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            res.status(201).json({ message: 'Parking space created successfully', id: result.insertId });
        });
    },

    updateParkingSpace: (req, res) => {
        var { space_id, is_occupied } = req.body;
        console.log("From controller",space_id,is_occupied);
        ParkingModel.updateParkingSpace({space_id,is_occupied}, (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            if (result.affectedRows === 0) {
                res.status(404).json({ error: `Parking space with id ${space_id} not found` });
                return;
            }
            res.json({ message: `Parking space with id ${space_id} updated successfully` });
        });
    },

    deleteParkingSpace: (req, res) => {
        const spaceId = req.params.id;
        ParkingModel.deleteParkingSpace(spaceId, (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            if (result.affectedRows === 0) {
                res.status(404).json({ error: `Parking space with id ${spaceId} not found` });
                return;
            }
            res.json({ message: `Parking space with id ${spaceId} deleted successfully` });
        });
    },

    getAllVehicles: (req, res) => {
        ParkingModel.getAllVehicles((err, results) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            res.json(results);
        });
    },

    getVehicleById: (req, res) => {
        const vehicleId = req.params.id;
        ParkingModel.getVehicleById(vehicleId, (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            if (!result) {
                res.status(404).json({ error: `Vehicle with id ${vehicleId} not found` });
                return;
            }
            res.json(result);
        });
    },

    createVehicle: (req, res) => {
        const { license_plate, owner_name, owner_contact, vehicle_type,hourly_rate } = req.body;
        ParkingModel.createVehicle({license_plate, owner_name, owner_contact, vehicle_type,hourly_rate}, (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            res.status(201).json({ message: 'Vehicle created successfully', id: result.insertId });
        });
    },

    updateLog: (req, res) => {
        const { license_plate, exit_time } = req.body;
        ParkingModel.updateLog({ license_plate, exit_time }, (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            if (result.affectedRows === 0) {
                res.status(404).json({ error: `Entry/Exit log with license_plate ${license_plate} not found` });
                return;
            }
            res.json({ message: `Entry/Exit log with license_plate ${license_plate} updated successfully` });
        });
    },

    deleteVehicle: (req, res) => {
        const vehicleId = req.params.id;
        ParkingModel.deleteVehicle(vehicleId, (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            if (result.affectedRows === 0) {
                res.status(404).json({ error: `Vehicle with id ${vehicleId} not found` });
                return;
            }
            res.json({ message: `Vehicle with id ${vehicleId} deleted successfully` });
        });
    },

    getAllLogs: (req, res) => {
        ParkingModel.getAllLogs((err, results) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            res.json(results);
        });
    },

    getLogById: (req, res) => {
        const logId = req.params.id;
        ParkingModel.getLogById(logId, (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            if (!result) {
                res.status(404).json({ error: `Entry/Exit log with id ${logId} not found` });
                return;
            }
            res.json(result);
        });
    },

    createLog: (req, res) => {
        const { license_plate, space_id, entry_time } = req.body;
        console.log('Received data:', req.body);
    
        ParkingModel.createLog({ license_plate, space_id, entry_time }, (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            res.status(201).json({ message: 'Entry/Exit log created successfully', id: result.insertId });
        });
    },
    
    

    
        updateLog: (req, res) => {
            const logId = req.params.id;
            const { license_plate, exit_time } = req.body;
            ParkingModel.updateLog({ license_plate, exit_time }, (err, result) => {
                if (err) {
                    console.error(err);
                    res.status(500).json({ error: 'Internal server error' });
                    return;
                }
                if (result.affectedRows === 0) {
                    res.status(404).json({ error: `Entry/Exit log with id ${logId} not found` });
                    return;
                }
                res.json({ message: `Entry/Exit log with id ${logId} updated successfully` });
            });
        },
    

    deleteLog: (req, res) => {
        const logId = req.params.id;
        ParkingModel.deleteLog(logId, (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            if (result.affectedRows === 0) {
                res.status(404).json({ error: `Entry/Exit log with id ${logId} not found` });
                return;
            }
            res.json({ message: `Entry/Exit log with id ${logId} deleted successfully` });
        });
    },

    getAvailableSpaces: (req, res) => {
        const parkingLotId = req.params.parking_lot_id;
        ParkingModel.getAvailableSpaces(parkingLotId, (err, results) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            res.json(results);
        });
    }
};

module.exports = ParkingController;
