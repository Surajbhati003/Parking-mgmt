const db = require('../config/db.config');

const CustomerModel = {
  // Create a new customer
  addCustomer: (customerData, callback) => {
    const { name, phone, email } = customerData;
    db.query(
      'INSERT INTO Customers (name, phone, email) VALUES (?, ?, ?)',
      [name, phone, email],
      callback
    );
  },

  // Get all customers
  getAllCustomers: (callback) => {
    db.query('SELECT * FROM Customers', callback);
  },

  // Get customer by ID
  getCustomerById: (cust_id, callback) => {
    db.query('SELECT * FROM Customers WHERE cust_id = ?', [cust_id], callback);
  },

  // Update customer
  updateCustomer: (cust_id, customerData, callback) => {
    const { name, phone, email } = customerData;
    db.query(
      'UPDATE Customers SET name = ?, phone = ?, email = ? WHERE cust_id = ?',
      [name, phone, email, cust_id],
      callback
    );
  },

  // Delete customer
  deleteCustomer: (cust_id, callback) => {
    db.query('DELETE FROM Customers WHERE cust_id = ?', [cust_id], callback);
  },

  // Get customer's vehicles
  getCustomerVehicles: (cust_id, callback) => {
    db.query('SELECT * FROM Vehicles WHERE customer_id = ?', [cust_id], callback);
  }
};

module.exports = CustomerModel;
