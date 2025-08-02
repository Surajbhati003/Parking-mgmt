const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');

// Create new customer
router.post('/', customerController.createCustomer);

// Get all customers
router.get('/', customerController.getAllCustomers);

// Get customer by ID
router.get('/:id', customerController.getCustomerById);

// Update customer by ID
router.put('/:id', customerController.updateCustomer);

// Delete customer by ID
router.delete('/:id', customerController.deleteCustomer);

// Get all vehicles of a customer
router.get('/:id/vehicles', customerController.getCustomerVehicles);

module.exports = router;
