const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');

// --------- 📊 DASHBOARD ANALYTICS ---------
// Available for both admin and manager (filtered by role)
router.get('/dashboard', analyticsController.getDashboardOverview);

// --------- 💰 REVENUE ANALYTICS (Admin Only) ---------
router.get('/revenue', analyticsController.getRevenueAnalytics);
router.get('/revenue/vehicle-types', analyticsController.getRevenueByVehicleType);

// --------- 🚗 OCCUPANCY ANALYTICS ---------
// Available for both admin and manager
router.get('/occupancy/current', analyticsController.getCurrentOccupancy);
router.get('/occupancy/vehicle-types', analyticsController.getOccupancyByVehicleType);

// --------- 📅 TIME-BASED ANALYTICS ---------
// Available for both admin and manager
router.get('/peak-hours', analyticsController.getPeakHoursAnalysis);
router.get('/trends', analyticsController.getUsageTrends);

// --------- 👥 CUSTOMER ANALYTICS (Admin Only) ---------
router.get('/customers/top', analyticsController.getTopCustomers);

// --------- 🏢 LOT PERFORMANCE (Admin Only) ---------
router.get('/lots/performance', analyticsController.getLotPerformanceComparison);

// --------- 🎯 MANAGER-SPECIFIC ANALYTICS ---------
router.get('/manager/lots', analyticsController.getManagerLotAnalytics);
router.get('/manager/activity', analyticsController.getRecentActivity);

// --------- 📊 EXPORT FUNCTIONS (Admin Only) ---------
router.get('/export', analyticsController.exportAnalyticsData);

module.exports = router;