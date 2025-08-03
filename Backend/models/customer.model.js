// const db = require('../config/db.config');

// const CustomerModel = {
//   // Create a new customer
//   addCustomer: (customerData, callback) => {
//     const { name, phone, email } = customerData;
//     db.query(
//       'INSERT INTO Customers (name, phone, email) VALUES (?, ?, ?)',
//       [name, phone, email],
//       callback
//     );
//   },

//   // Get all customers
//   getAllCustomers: (callback) => {
//     db.query('SELECT * FROM Customers', callback);
//   },

//   // Get customer by ID
//   getCustomerById: (cust_id, callback) => {
//     db.query('SELECT * FROM Customers WHERE cust_id = ?', [cust_id], callback);
//   },

//   // Update customer
//   updateCustomer: (cust_id, customerData, callback) => {
//     const { name, phone, email } = customerData;
//     db.query(
//       'UPDATE Customers SET name = ?, phone = ?, email = ? WHERE cust_id = ?',
//       [name, phone, email, cust_id],
//       callback
//     );
//   },

//   // Delete customer
//   deleteCustomer: (cust_id, callback) => {
//     db.query('DELETE FROM Customers WHERE cust_id = ?', [cust_id], callback);
//   },

//   // Get customer's vehicles
//   getCustomerVehicles: (cust_id, callback) => {
//     db.query('SELECT * FROM Vehicles WHERE customer_id = ?', [cust_id], callback);
//   }
// };

// module.exports = CustomerModel;
// Backend/models/customer.model.js
const db = require('../config/db.config');

const CustomerModel = {
  // Create a new customer (matches your Customers table schema)
  addCustomer: (customerData, callback) => {
    const { Name, Phone, Gender } = customerData; // Note: Capital N in Name to match schema
    db.query(
      'INSERT INTO Customers (Name, Phone, Gender) VALUES (?, ?, ?)',
      [Name, Phone, Gender],
      callback
    );
  },

  // Get all customers
  getAllCustomers: (callback) => {
    db.query('SELECT * FROM Customers ORDER BY created_at DESC', callback);
  },

  // Get customer by ID
  getCustomerById: (cust_id, callback) => {
    db.query('SELECT * FROM Customers WHERE cust_id = ?', [cust_id], callback);
  },

  // Get customer by phone (useful for parking system)
  getCustomerByPhone: (phone, callback) => {
    db.query('SELECT * FROM Customers WHERE Phone = ?', [phone], callback);
  },

  // Update customer (matches your schema fields)
  updateCustomer: (cust_id, customerData, callback) => {
    const { Name, Phone, Gender } = customerData;
    db.query(
      'UPDATE Customers SET Name = ?, Phone = ?, Gender = ? WHERE cust_id = ?',
      [Name, Phone, Gender, cust_id],
      callback
    );
  },

  // Delete customer
  deleteCustomer: (cust_id, callback) => {
    db.query('DELETE FROM Customers WHERE cust_id = ?', [cust_id], callback);
  },

  // Get customer's vehicles (joins with Vehicles table)
  getCustomerVehicles: (cust_id, callback) => {
    const query = `
      SELECT 
        v.license_plate,
        v.v_type_id,
        vt.v_type_name,
        vt.hourly_rate
      FROM Vehicles v
      JOIN vehicle_type vt ON v.v_type_id = vt.v_type_id
      WHERE v.customer_id = ?
    `;
    db.query(query, [cust_id], callback);
  },

  // Search customers by name or phone
  searchCustomers: (searchTerm, callback) => {
    const query = `
      SELECT * FROM Customers 
      WHERE Name LIKE ? OR Phone LIKE ?
      ORDER BY Name
    `;
    const searchPattern = `%${searchTerm}%`;
    db.query(query, [searchPattern, searchPattern], callback);
  },

  // Get customer with vehicle count (useful for dashboard)
  getCustomerStats: (callback) => {
    const query = `
      SELECT 
        c.*,
        COUNT(v.license_plate) as vehicle_count
      FROM Customers c
      LEFT JOIN Vehicles v ON c.cust_id = v.customer_id
      GROUP BY c.cust_id
      ORDER BY c.created_at DESC
    `;
    db.query(query, callback);
  }
};

module.exports = CustomerModel;
