// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const verifyToken = require('../middleware/auth');
const { requireRole } = require('../middleware/role'); 

// Register
router.post('/register', authController.register);

// Login
router.post('/login', authController.login);

// 🔐 Reset password (Admin-only)
router.post('/reset-password', verifyToken, requireRole('admin'), authController.resetPassword);


module.exports = router;
