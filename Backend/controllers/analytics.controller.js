const Analytics = require('../models/analytics.model');

// --------- 🔐 AUTHENTICATION HELPER ---------
const checkUserAccess = (req, res, next) => {
    // This should be replaced with your actual authentication middleware
    // For now, assuming user info is passed in headers or body
    const user_role = req.headers['user-role'] || req.body.user_role;
    const user_id = req.headers['user-id'] || req.body.user_id;
    
    if (!user_role || !user_id) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required. Please provide user-role and user-id headers.'
        });
    }
    
    req.user = { role: user_role, id: user_id };
    next();
};

// --------- 📊 DASHBOARD ANALYTICS ---------

exports.getDashboardOverview = [checkUserAccess, (req, res) => {
    const { role, id } = req.user;
    const manager_id = role === 'manager' ? id : null;
    
    Analytics.getDashboardOverview(role, manager_id, (err, results) => {
        if (err) {
            console.error('Error getting dashboard overview:', err);
            return res.status(500).json({
                success: false,
                error: err.message
            });
        }
        
        const overview = results[0] || {};
        
        res.json({
            success: true,
            message: `Dashboard overview for ${role}`,
            data: {
                access_level: role,
                overview: {
                    total_lots: parseInt(overview.total_lots) || 0,
                    total_spaces: parseInt(overview.total_spaces) || 0,
                    occupied_spaces: parseInt(overview.occupied_spaces) || 0,
                    available_spaces: parseInt(overview.available_spaces) || 0,
                    occupancy_rate: overview.total_spaces > 0 
                        ? ((overview.occupied_spaces / overview.total_spaces) * 100).toFixed(2) + '%'
                        : '0%',
                    active_sessions: parseInt(overview.active_logs) || 0,
                    total_vehicles: parseInt(overview.total_vehicles) || 0,
                    total_customers: parseInt(overview.total_customers) || 0
                }
            }
        });
    });
}];

// --------- 💰 REVENUE ANALYTICS (Admin Heavy) ---------

exports.getRevenueAnalytics = [checkUserAccess, (req, res) => {
    const { role, id } = req.user;
    
    // Only admin can access all lots revenue, manager only their lot
    if (role === 'manager') {
        return res.status(403).json({
            success: false,
            message: 'Revenue analytics access restricted. Managers can only view basic lot performance.'
        });
    }
    
    const { start_date, end_date, lot_id } = req.query;
    
    Analytics.getRevenueAnalytics(start_date, end_date, lot_id, (err, results) => {
        if (err) {
            console.error('Error getting revenue analytics:', err);
            return res.status(500).json({
                success: false,
                error: err.message
            });
        }
        
        const totalRevenue = results.reduce((sum, record) => sum + parseFloat(record.daily_revenue || 0), 0);
        
        res.json({
            success: true,
            message: 'Revenue analytics retrieved successfully',
            data: {
                access_level: 'admin_only',
                summary: {
                    total_revenue: totalRevenue.toFixed(2),
                    total_sessions: results.reduce((sum, record) => sum + parseInt(record.total_sessions || 0), 0),
                    date_range: { start_date, end_date }
                },
                daily_breakdown: results,
                count: results.length
            }
        });
    });
}];

exports.getRevenueByVehicleType = [checkUserAccess, (req, res) => {
    const { role } = req.user;
    
    if (role === 'manager') {
        return res.status(403).json({
            success: false,
            message: 'Detailed revenue analytics access restricted to admin only.'
        });
    }
    
    const { start_date, end_date, lot_id } = req.query;
    
    Analytics.getRevenueByVehicleType(start_date, end_date, lot_id, (err, results) => {
        if (err) {
            console.error('Error getting revenue by vehicle type:', err);
            return res.status(500).json({
                success: false,
                error: err.message
            });
        }
        
        res.json({
            success: true,
            message: 'Revenue by vehicle type retrieved successfully',
            data: {
                access_level: 'admin_only',
                breakdown: results,
                count: results.length
            }
        });
    });
}];

// --------- 🚗 OCCUPANCY ANALYTICS ---------

exports.getCurrentOccupancy = [checkUserAccess, (req, res) => {
    const { role, id } = req.user;
    const { lot_id } = req.query;
    
    // Manager can only see their own lots
    let queryLotId = lot_id;
    if (role === 'manager') {
        // For managers, we'll filter by their managed lots in the model
        // This is a simplified approach - in production, you'd verify lot ownership
        queryLotId = lot_id;
    }
    
    Analytics.getCurrentOccupancy(queryLotId, (err, results) => {
        if (err) {
            console.error('Error getting current occupancy:', err);
            return res.status(500).json({
                success: false,
                error: err.message
            });
        }
        
        res.json({
            success: true,
            message: 'Current occupancy retrieved successfully',
            data: {
                access_level: role,
                occupancy_data: results,
                count: results.length
            }
        });
    });
}];

exports.getOccupancyByVehicleType = [checkUserAccess, (req, res) => {
    const { role } = req.user;
    const { lot_id } = req.query;
    
    Analytics.getOccupancyByVehicleType(lot_id, (err, results) => {
        if (err) {
            console.error('Error getting occupancy by vehicle type:', err);
            return res.status(500).json({
                success: false,
                error: err.message
            });
        }
        
        res.json({
            success: true,
            message: 'Occupancy by vehicle type retrieved successfully',
            data: {
                access_level: role,
                vehicle_type_breakdown: results,
                count: results.length
            }
        });
    });
}];

// --------- 📅 TIME-BASED ANALYTICS ---------

exports.getPeakHoursAnalysis = [checkUserAccess, (req, res) => {
    const { role } = req.user;
    const { lot_id, date_range_days = 30 } = req.query;
    
    Analytics.getPeakHoursAnalysis(lot_id, date_range_days, (err, results) => {
        if (err) {
            console.error('Error getting peak hours analysis:', err);
            return res.status(500).json({
                success: false,
                error: err.message
            });
        }
        
        res.json({
            success: true,
            message: 'Peak hours analysis retrieved successfully',
            data: {
                access_level: role,
                analysis_period_days: date_range_days,
                peak_hours: results,
                count: results.length
            }
        });
    });
}];

exports.getUsageTrends = [checkUserAccess, (req, res) => {
    const { role } = req.user;
    const { period = 'weekly', lot_id } = req.query;
    
    if (!['daily', 'weekly', 'monthly'].includes(period)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid period. Use: daily, weekly, or monthly'
        });
    }
    
    Analytics.getUsageTrends(period, lot_id, (err, results) => {
        if (err) {
            console.error('Error getting usage trends:', err);
            return res.status(500).json({
                success: false,
                error: err.message
            });
        }
        
        res.json({
            success: true,
            message: `${period.charAt(0).toUpperCase() + period.slice(1)} usage trends retrieved successfully`,
            data: {
                access_level: role,
                period: period,
                trends: results,
                count: results.length
            }
        });
    });
}];

// --------- 👥 CUSTOMER ANALYTICS (Admin Heavy) ---------

exports.getTopCustomers = [checkUserAccess, (req, res) => {
    const { role } = req.user;
    
    if (role === 'manager') {
        return res.status(403).json({
            success: false,
            message: 'Customer analytics access restricted to admin only.'
        });
    }
    
    const { limit = 10, lot_id } = req.query;
    
    Analytics.getTopCustomers(limit, lot_id, (err, results) => {
        if (err) {
            console.error('Error getting top customers:', err);
            return res.status(500).json({
                success: false,
                error: err.message
            });
        }
        
        res.json({
            success: true,
            message: 'Top customers retrieved successfully',
            data: {
                access_level: 'admin_only',
                top_customers: results,
                count: results.length
            }
        });
    });
}];

// --------- 🏢 LOT PERFORMANCE (Admin Only) ---------

exports.getLotPerformanceComparison = [checkUserAccess, (req, res) => {
    const { role } = req.user;
    
    if (role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Lot performance comparison access restricted to admin only.'
        });
    }
    
    const { start_date, end_date } = req.query;
    
    Analytics.getLotPerformanceComparison(start_date, end_date, (err, results) => {
        if (err) {
            console.error('Error getting lot performance comparison:', err);
            return res.status(500).json({
                success: false,
                error: err.message
            });
        }
        
        res.json({
            success: true,
            message: 'Lot performance comparison retrieved successfully',
            data: {
                access_level: 'admin_only',
                date_range: { start_date, end_date },
                lot_performance: results,
                count: results.length
            }
        });
    });
}];

// --------- 🎯 MANAGER-SPECIFIC ANALYTICS ---------

exports.getManagerLotAnalytics = [checkUserAccess, (req, res) => {
    const { role, id } = req.user;
    
    if (role !== 'manager') {
        return res.status(403).json({
            success: false,
            message: 'This endpoint is specifically for managers only.'
        });
    }
    
    Analytics.getManagerLotAnalytics(id, (err, results) => {
        if (err) {
            console.error('Error getting manager lot analytics:', err);
            return res.status(500).json({
                success: false,
                error: err.message
            });
        }
        
        res.json({
            success: true,
            message: 'Manager lot analytics retrieved successfully',
            data: {
                access_level: 'manager_only',
                manager_id: id,
                managed_lots: results,
                count: results.length
            }
        });
    });
}];

exports.getRecentActivity = [checkUserAccess, (req, res) => {
    const { role, id } = req.user;
    
    if (role !== 'manager') {
        return res.status(403).json({
            success: false,
            message: 'Recent activity endpoint is for managers only.'
        });
    }
    
    const { limit = 20 } = req.query;
    
    Analytics.getRecentActivity(id, limit, (err, results) => {
        if (err) {
            console.error('Error getting recent activity:', err);
            return res.status(500).json({
                success: false,
                error: err.message
            });
        }
        
        res.json({
            success: true,
            message: 'Recent activity retrieved successfully',
            data: {
                access_level: 'manager_only',
                manager_id: id,
                recent_activities: results,
                count: results.length
            }
        });
    });
}];

// --------- 📊 EXPORT FUNCTIONS (Admin Heavy) ---------

exports.exportAnalyticsData = [checkUserAccess, (req, res) => {
    const { role } = req.user;
    
    if (role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Data export access restricted to admin only.'
        });
    }
    
    const { export_type, start_date, end_date, lot_id } = req.query;
    
    if (!export_type || !['revenue', 'occupancy', 'customers', 'lots'].includes(export_type)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid export_type. Use: revenue, occupancy, customers, or lots'
        });
    }
    
    // This would typically generate CSV/Excel files
    // For now, returning JSON data that can be exported
    let exportPromise;
    
    switch (export_type) {
        case 'revenue':
            exportPromise = new Promise((resolve, reject) => {
                Analytics.getRevenueAnalytics(start_date, end_date, lot_id, (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });
            break;
        case 'occupancy':
            exportPromise = new Promise((resolve, reject) => {
                Analytics.getCurrentOccupancy(lot_id, (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });
            break;
        case 'customers':
            exportPromise = new Promise((resolve, reject) => {
                Analytics.getTopCustomers(100, lot_id, (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });
            break;
        case 'lots':
            exportPromise = new Promise((resolve, reject) => {
                Analytics.getLotPerformanceComparison(start_date, end_date, (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });
            break;
    }
    
    exportPromise
        .then(data => {
            res.json({
                success: true,
                message: `${export_type} data exported successfully`,
                data: {
                    access_level: 'admin_only',
                    export_type: export_type,
                    export_timestamp: new Date().toISOString(),
                    exported_data: data,
                    count: data.length
                }
            });
        })
        .catch(err => {
            console.error('Error exporting data:', err);
            res.status(500).json({
                success: false,
                error: err.message
            });
        });
}];

module.exports = {
    // Dashboard
    getDashboardOverview: exports.getDashboardOverview,
    
    // Revenue Analytics (Admin Only)
    getRevenueAnalytics: exports.getRevenueAnalytics,
    getRevenueByVehicleType: exports.getRevenueByVehicleType,
    
    // Occupancy Analytics
    getCurrentOccupancy: exports.getCurrentOccupancy,
    getOccupancyByVehicleType: exports.getOccupancyByVehicleType,
    
    // Time-based Analytics
    getPeakHoursAnalysis: exports.getPeakHoursAnalysis,
    getUsageTrends: exports.getUsageTrends,
    
    // Customer Analytics (Admin Only)
    getTopCustomers: exports.getTopCustomers,
    
    // Lot Performance (Admin Only)
    getLotPerformanceComparison: exports.getLotPerformanceComparison,
    
    // Manager-specific
    getManagerLotAnalytics: exports.getManagerLotAnalytics,
    getRecentActivity: exports.getRecentActivity,
    
    // Export (Admin Only)
    exportAnalyticsData: exports.exportAnalyticsData
};