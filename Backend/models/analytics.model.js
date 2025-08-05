const db = require('../config/db.config');

const AnalyticsModel = {
    // --------- 📊 GENERAL ANALYTICS ---------
    
    // Dashboard Overview - Different for Admin vs Manager
    getDashboardOverview: (user_role, manager_id = null, callback) => {
        let whereClause = '';
        let params = [];
        
        if (user_role === 'manager' && manager_id) {
            whereClause = 'WHERE pl.manager_id = ?';
            params = [manager_id];
        }
        
        const query = `
            SELECT 
                COUNT(DISTINCT pl.lot_id) as total_lots,
                COUNT(DISTINCT ps.space_id) as total_spaces,
                COUNT(DISTINCT CASE WHEN ps.is_occupied = 1 THEN ps.space_id END) as occupied_spaces,
                COUNT(DISTINCT CASE WHEN ps.is_occupied = 0 THEN ps.space_id END) as available_spaces,
                COUNT(DISTINCT eel.log_id) as total_logs,
                COUNT(DISTINCT CASE WHEN eel.status = 'open' THEN eel.log_id END) as active_logs,
                COUNT(DISTINCT v.license_plate) as total_vehicles,
                COUNT(DISTINCT c.cust_id) as total_customers
            FROM ParkingLots pl
            LEFT JOIN ParkingSpaces ps ON pl.lot_id = ps.lot_id
            LEFT JOIN EntryExitLogs eel ON ps.space_id = eel.space_id
            LEFT JOIN Vehicles v ON eel.license_plate = v.license_plate
            LEFT JOIN Customers c ON v.customer_id = c.cust_id
            ${whereClause}
        `;
        db.query(query, params, callback);
    },

    // --------- 📈 REVENUE ANALYTICS (Admin Heavy) ---------
    
    // Revenue by Date Range
    getRevenueAnalytics: (start_date, end_date, lot_id = null, callback) => {
        let whereClause = 'WHERE eel.status = "closed" AND eel.exit_time IS NOT NULL';
        let params = [];
        
        if (start_date && end_date) {
            whereClause += ' AND DATE(eel.entry_time) BETWEEN ? AND ?';
            params.push(start_date, end_date);
        }
        
        if (lot_id) {
            whereClause += ' AND ps.lot_id = ?';
            params.push(lot_id);
        }
        
        const query = `
            SELECT 
                DATE(eel.entry_time) as date,
                pl.lot_id,
                MAX(pl.name) as lot_name,
                COUNT(eel.log_id) as total_sessions,
                SUM(TIMESTAMPDIFF(HOUR, eel.entry_time, eel.exit_time) * vt.hourly_rate) as daily_revenue,
                AVG(TIMESTAMPDIFF(HOUR, eel.entry_time, eel.exit_time)) as avg_duration_hours
            FROM EntryExitLogs eel
            JOIN ParkingSpaces ps ON eel.space_id = ps.space_id
            JOIN ParkingLots pl ON ps.lot_id = pl.lot_id
            JOIN Vehicles v ON eel.license_plate = v.license_plate
            JOIN vehicle_type vt ON v.v_type_id = vt.v_type_id
            ${whereClause}
            GROUP BY DATE(eel.entry_time), pl.lot_id
            ORDER BY date DESC
        `;
        db.query(query, params, callback);
    },

    // Revenue by Vehicle Type
    getRevenueByVehicleType: (start_date, end_date, lot_id = null, callback) => {
        let whereClause = 'WHERE eel.status = "closed" AND eel.exit_time IS NOT NULL';
        let params = [];
        
        if (start_date && end_date) {
            whereClause += ' AND DATE(eel.entry_time) BETWEEN ? AND ?';
            params.push(start_date, end_date);
        }
        
        if (lot_id) {
            whereClause += ' AND ps.lot_id = ?';
            params.push(lot_id);
        }
        
        const query = `
            SELECT 
                vt.v_type_name,
                vt.hourly_rate,
                COUNT(eel.log_id) as total_sessions,
                SUM(TIMESTAMPDIFF(HOUR, eel.entry_time, eel.exit_time) * vt.hourly_rate) as total_revenue,
                AVG(TIMESTAMPDIFF(HOUR, eel.entry_time, eel.exit_time)) as avg_duration_hours
            FROM EntryExitLogs eel
            JOIN ParkingSpaces ps ON eel.space_id = ps.space_id
            JOIN Vehicles v ON eel.license_plate = v.license_plate
            JOIN vehicle_type vt ON v.v_type_id = vt.v_type_id
            ${whereClause}
            GROUP BY vt.v_type_id
            ORDER BY total_revenue DESC
        `;
        db.query(query, params, callback);
    },

    // --------- 🚗 OCCUPANCY ANALYTICS ---------
    
    // Current Occupancy by Lot
    getCurrentOccupancy: (lot_id = null, callback) => {
        let whereClause = '';
        let params = [];
        
        if (lot_id) {
            whereClause = 'WHERE pl.lot_id = ?';
            params = [lot_id];
        }
        
        const query = `
            SELECT 
                pl.lot_id,
                pl.name as lot_name,
                pl.location,
                pl.total_spaces,
                COUNT(ps.space_id) as configured_spaces,
                COUNT(CASE WHEN ps.is_occupied = 1 THEN 1 END) as occupied_spaces,
                COUNT(CASE WHEN ps.is_occupied = 0 THEN 1 END) as available_spaces,
                ROUND((COUNT(CASE WHEN ps.is_occupied = 1 THEN 1 END) / COUNT(ps.space_id)) * 100, 2) as occupancy_percentage
            FROM ParkingLots pl
            LEFT JOIN ParkingSpaces ps ON pl.lot_id = ps.lot_id
            ${whereClause}
            GROUP BY pl.lot_id
            ORDER BY occupancy_percentage DESC
        `;
        db.query(query, params, callback);
    },

    // Occupancy by Vehicle Type
    getOccupancyByVehicleType: (lot_id = null, callback) => {
        let whereClause = '';
        let params = [];
        
        if (lot_id) {
            whereClause = 'WHERE ps.lot_id = ?';
            params = [lot_id];
        }
        
        const query = `
            SELECT 
                vt.v_type_name,
                COUNT(ps.space_id) as total_spaces,
                COUNT(CASE WHEN ps.is_occupied = 1 THEN 1 END) as occupied_spaces,
                COUNT(CASE WHEN ps.is_occupied = 0 THEN 1 END) as available_spaces,
                ROUND((COUNT(CASE WHEN ps.is_occupied = 1 THEN 1 END) / COUNT(ps.space_id)) * 100, 2) as occupancy_percentage
            FROM ParkingSpaces ps
            JOIN vehicle_type vt ON ps.v_type_id = vt.v_type_id
            ${whereClause}
            GROUP BY vt.v_type_id
            ORDER BY occupancy_percentage DESC
        `;
        db.query(query, params, callback);
    },

    // --------- 📅 TIME-BASED ANALYTICS ---------
    
    // Peak Hours Analysis
    getPeakHoursAnalysis: (lot_id = null, date_range_days = 30, callback) => {
        let whereClause = 'WHERE eel.entry_time >= DATE_SUB(NOW(), INTERVAL ? DAY)';
        let params = [date_range_days];
        
        if (lot_id) {
            whereClause += ' AND ps.lot_id = ?';
            params.push(lot_id);
        }
        
        const query = `
            SELECT 
                HOUR(eel.entry_time) as hour_of_day,
                DAYOFWEEK(eel.entry_time) as day_of_week,
                DAYNAME(DATE(eel.entry_time)) as day_name,
                COUNT(eel.log_id) as entry_count,
                AVG(TIMESTAMPDIFF(MINUTE, eel.entry_time, IFNULL(eel.exit_time, NOW()))) as avg_duration_minutes
            FROM EntryExitLogs eel
            JOIN ParkingSpaces ps ON eel.space_id = ps.space_id
            ${whereClause}
            GROUP BY HOUR(eel.entry_time), DAYOFWEEK(eel.entry_time), DAYNAME(DATE(eel.entry_time))
            ORDER BY entry_count DESC
        `;
        db.query(query, params, callback);
    },

    // Weekly/Monthly Trends
    getUsageTrends: (period = 'weekly', lot_id = null, callback) => {
        let dateFormat, periodGroup, whereClause = '';
        let params = [];
        
        if (period === 'weekly') {
            dateFormat = 'YEARWEEK(eel.entry_time, 1)';
            periodGroup = 'YEARWEEK(eel.entry_time, 1)';
        } else if (period === 'monthly') {
            dateFormat = 'DATE_FORMAT(eel.entry_time, "%Y-%m")';
            periodGroup = 'YEAR(eel.entry_time), MONTH(eel.entry_time)';
        } else {
            dateFormat = 'DATE(eel.entry_time)';
            periodGroup = 'DATE(eel.entry_time)';
        }
        
        if (lot_id) {
            whereClause = 'WHERE ps.lot_id = ?';
            params = [lot_id];
        }
        
        const query = `
            SELECT 
                ${dateFormat} as time_period,
                COUNT(eel.log_id) as total_entries,
                COUNT(CASE WHEN eel.status = 'closed' THEN 1 END) as completed_sessions,
                AVG(CASE WHEN eel.status = 'closed' 
                    THEN TIMESTAMPDIFF(HOUR, eel.entry_time, eel.exit_time) 
                    ELSE NULL END) as avg_duration_hours,
                COUNT(DISTINCT eel.license_plate) as unique_vehicles
            FROM EntryExitLogs eel
            JOIN ParkingSpaces ps ON eel.space_id = ps.space_id
            ${whereClause}
            GROUP BY ${periodGroup}
            ORDER BY time_period DESC
            LIMIT 12
        `;
        db.query(query, params, callback);
    },

    // --------- 👥 CUSTOMER ANALYTICS (Admin Heavy) ---------
    
    // Top Customers by Usage
    getTopCustomers: (limit = 10, lot_id = null, callback) => {
        let whereClause = '';
        let params = [];
        
        if (lot_id) {
            whereClause = 'WHERE ps.lot_id = ?';
            params = [lot_id];
        }
        
        params.push(limit);
        
        const query = `
            SELECT 
                c.cust_id,
                c.Name as customer_name,
                c.Phone as customer_phone,
                COUNT(eel.log_id) as total_visits,
                COUNT(CASE WHEN eel.status = 'closed' THEN 1 END) as completed_visits,
                SUM(CASE WHEN eel.status = 'closed' 
                    THEN TIMESTAMPDIFF(HOUR, eel.entry_time, eel.exit_time) * vt.hourly_rate 
                    ELSE 0 END) as total_revenue_generated,
                AVG(TIMESTAMPDIFF(HOUR, eel.entry_time, IFNULL(eel.exit_time, NOW()))) as avg_duration_hours,
                MAX(eel.entry_time) as last_visit
            FROM Customers c
            JOIN Vehicles v ON c.cust_id = v.customer_id
            JOIN EntryExitLogs eel ON v.license_plate = eel.license_plate
            JOIN ParkingSpaces ps ON eel.space_id = ps.space_id
            JOIN vehicle_type vt ON v.v_type_id = vt.v_type_id
            ${whereClause}
            GROUP BY c.cust_id
            ORDER BY total_visits DESC
            LIMIT ?
        `;
        db.query(query, params, callback);
    },

    // --------- 🏢 LOT PERFORMANCE (Admin Only) ---------
    
    // Compare All Lots Performance
    getLotPerformanceComparison: (start_date, end_date, callback) => {
        let whereClause = '';
        let params = [];
        
        if (start_date && end_date) {
            whereClause = 'AND DATE(eel.entry_time) BETWEEN ? AND ?';
            params = [start_date, end_date];
        }
        
        const query = `
            SELECT 
                pl.lot_id,
                pl.name as lot_name,
                pl.location,
                pl.total_spaces,
                MAX(u.name) as manager_name,
                COUNT(eel.log_id) as total_entries,
                COUNT(CASE WHEN eel.status = 'closed' THEN 1 END) as completed_sessions,
                SUM(CASE WHEN eel.status = 'closed' 
                    THEN TIMESTAMPDIFF(HOUR, eel.entry_time, eel.exit_time) * vt.hourly_rate 
                    ELSE 0 END) as total_revenue,
                AVG(CASE WHEN eel.status = 'closed' 
                    THEN TIMESTAMPDIFF(HOUR, eel.entry_time, eel.exit_time) 
                    ELSE NULL END) as avg_duration_hours,
                COUNT(DISTINCT eel.license_plate) as unique_vehicles,
                ROUND((COUNT(CASE WHEN ps.is_occupied = 1 THEN 1 END) / 
                      NULLIF(COUNT(ps.space_id), 0)) * 100, 2) as current_occupancy_percentage
            FROM ParkingLots pl
            LEFT JOIN users u ON pl.manager_id = u.user_id
            LEFT JOIN ParkingSpaces ps ON pl.lot_id = ps.lot_id
            LEFT JOIN EntryExitLogs eel ON ps.space_id = eel.space_id ${whereClause}
            LEFT JOIN Vehicles v ON eel.license_plate = v.license_plate
            LEFT JOIN vehicle_type vt ON v.v_type_id = vt.v_type_id
            GROUP BY pl.lot_id, pl.name, pl.location, pl.total_spaces
            ORDER BY total_revenue DESC
        `;
        db.query(query, params, callback);
    },

    // --------- 🎯 MANAGER-SPECIFIC ANALYTICS ---------
    
    // Manager's Lot Detailed Analytics
    getManagerLotAnalytics: (manager_id, callback) => {
        const query = `
            SELECT 
                pl.lot_id,
                pl.name as lot_name,
                pl.location,
                pl.total_spaces,
                COUNT(DISTINCT ps.space_id) as configured_spaces,
                COUNT(DISTINCT CASE WHEN ps.is_occupied = 1 THEN ps.space_id END) as occupied_spaces,
                COUNT(DISTINCT eel.log_id) as total_logs_today,
                COUNT(DISTINCT CASE WHEN eel.status = 'open' THEN eel.log_id END) as active_sessions,
                COUNT(DISTINCT CASE WHEN DATE(eel.entry_time) = CURDATE() THEN eel.log_id END) as today_entries
            FROM ParkingLots pl
            LEFT JOIN ParkingSpaces ps ON pl.lot_id = ps.lot_id
            LEFT JOIN EntryExitLogs eel ON ps.space_id = eel.space_id AND DATE(eel.entry_time) = CURDATE()
            WHERE pl.manager_id = ?
            GROUP BY pl.lot_id
        `;
        db.query(query, [manager_id], callback);
    },

    // Recent Activity for Manager
    getRecentActivity: (manager_id, limit = 20, callback) => {
        const query = `
            SELECT 
                eel.log_id,
                eel.license_plate,
                eel.entry_time,
                eel.exit_time,
                eel.status,
                ps.space_number,
                pl.name as lot_name,
                c.Name as customer_name,
                vt.v_type_name,
                CASE 
                    WHEN eel.status = 'closed' 
                    THEN TIMESTAMPDIFF(HOUR, eel.entry_time, eel.exit_time) * vt.hourly_rate 
                    ELSE 0 
                END as revenue
            FROM EntryExitLogs eel
            JOIN ParkingSpaces ps ON eel.space_id = ps.space_id
            JOIN ParkingLots pl ON ps.lot_id = pl.lot_id
            JOIN Vehicles v ON eel.license_plate = v.license_plate
            JOIN Customers c ON v.customer_id = c.cust_id
            JOIN vehicle_type vt ON v.v_type_id = vt.v_type_id
            WHERE pl.manager_id = ?
            ORDER BY eel.entry_time DESC
            LIMIT ?
        `;
        db.query(query, [manager_id, limit], callback);
    }
};

module.exports = AnalyticsModel;