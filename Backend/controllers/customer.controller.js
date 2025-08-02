const Customer = require('../models/customer.model');

// Create new customer
exports.createCustomer = (req, res) => {
  const { name, phone, email } = req.body;
  if (!name || !email) return res.status(400).json({ message: 'Name and email are required' });

  Customer.addCustomer({ name, phone, email }, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Customer created successfully', id: result.insertId });
  });
};

// Get all customers
exports.getAllCustomers = (req, res) => {
  Customer.getAllCustomers((err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Get customer by ID
exports.getCustomerById = (req, res) => {
  const cust_id = req.params.id;
  Customer.getCustomerById(cust_id, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'Customer not found' });
    res.json(results[0]);
  });
};

// Update customer
exports.updateCustomer = (req, res) => {
  const cust_id = req.params.id;
  const { name, phone, email } = req.body;

  Customer.updateCustomer(cust_id, { name, phone, email }, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Customer not found' });
    res.json({ message: 'Customer updated successfully' });
  });
};

// Delete customer
exports.deleteCustomer = (req, res) => {
  const cust_id = req.params.id;

  Customer.deleteCustomer(cust_id, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Customer not found' });
    res.json({ message: 'Customer deleted successfully' });
  });
};

// Get customer's vehicles
exports.getCustomerVehicles = (req, res) => {
  const cust_id = req.params.id;

  Customer.getCustomerVehicles(cust_id, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};
