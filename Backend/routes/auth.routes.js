const { ensureAuthenticated, requireRole } = require('../middleware/auth');

// Example: Admin dashboard route
router.get('/admin', ensureAuthenticated, requireRole('admin'), (req, res) => {
    res.render('admin');
});

// Manager route
router.get('/manager', ensureAuthenticated, requireRole('manager'), (req, res) => {
    res.render('manager');
});

// User route
router.get('/user', ensureAuthenticated, requireRole('user'), (req, res) => {
    res.render('user');
});
const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');