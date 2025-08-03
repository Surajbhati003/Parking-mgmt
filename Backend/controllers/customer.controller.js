// const Customer = require('../models/customer.model');

// // Create new customer
// exports.createCustomer = (req, res) => {
//   const { name, phone, email } = req.body;
//   if (!name || !email) return res.status(400).json({ message: 'Name and email are required' });

//   Customer.addCustomer({ name, phone, email }, (err, result) => {
//     if (err) return res.status(500).json({ error: err.message });
//     res.status(201).json({ message: 'Customer created successfully', id: result.insertId });
//   });
// };

// // Get all customers
// exports.getAllCustomers = (req, res) => {
//   Customer.getAllCustomers((err, results) => {
//     if (err) return res.status(500).json({ error: err.message });
//     res.json(results);
//   });
// };

// // Get customer by ID
// exports.getCustomerById = (req, res) => {
//   const cust_id = req.params.id;
//   Customer.getCustomerById(cust_id, (err, results) => {
//     if (err) return res.status(500).json({ error: err.message });
//     if (results.length === 0) return res.status(404).json({ message: 'Customer not found' });
//     res.json(results[0]);
//   });
// };

// // Update customer
// exports.updateCustomer = (req, res) => {
//   const cust_id = req.params.id;
//   const { name, phone, email } = req.body;

//   Customer.updateCustomer(cust_id, { name, phone, email }, (err, result) => {
//     if (err) return res.status(500).json({ error: err.message });
//     if (result.affectedRows === 0) return res.status(404).json({ message: 'Customer not found' });
//     res.json({ message: 'Customer updated successfully' });
//   });
// };

// // Delete customer
// exports.deleteCustomer = (req, res) => {
//   const cust_id = req.params.id;

//   Customer.deleteCustomer(cust_id, (err, result) => {
//     if (err) return res.status(500).json({ error: err.message });
//     if (result.affectedRows === 0) return res.status(404).json({ message: 'Customer not found' });
//     res.json({ message: 'Customer deleted successfully' });
//   });
// };

// // Get customer's vehicles
// exports.getCustomerVehicles = (req, res) => {
//   const cust_id = req.params.id;

//   Customer.getCustomerVehicles(cust_id, (err, results) => {
//     if (err) return res.status(500).json({ error: err.message });
//     res.json(results);
//   });
// };
//priyanshu code from here
// controllers/customer.controller.js
const Customer = require('../models/customer.model');

// Create new customer
exports.createCustomer = (req, res) => {
  console.log('Request body:', req.body); // Debug logging
  const { Name, Phone, Gender } = req.body; // Match your database schema
     
  if (!Name || !Phone) {
    return res.status(400).json({
      success: false,
      message: 'Name and Phone are required'
    });
  }

  // Validate Gender enum
  const validGenders = ['Male', 'Female', 'Other', 'Prefer not to say'];
  if (Gender && !validGenders.includes(Gender)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid Gender. Must be: Male, Female, Other, or Prefer not to say'
    });
  }

  Customer.addCustomer({ Name, Phone, Gender }, (err, result) => {
    if (err) {
      console.error('Error creating customer:', err);
      return res.status(500).json({
        success: false,
        error: err.message
      });
    }
        
    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: {
        cust_id: result.insertId,
        Name,
        Phone,
        Gender
      }
    });
  });
};

// Get all customers
exports.getAllCustomers = (req, res) => {
  Customer.getAllCustomers((err, results) => {
    if (err) {
      console.error('Error getting customers:', err);
      return res.status(500).json({
        success: false,
        error: err.message
      });
    }
        
    res.json({
      success: true,
      message: 'Customers retrieved successfully',
      data: results,
      count: results.length
    });
  });
};

// Get customer by ID
exports.getCustomerById = (req, res) => {
  const cust_id = req.params.id;
    
  Customer.getCustomerById(cust_id, (err, results) => {
    if (err) {
      console.error('Error getting customer:', err);
      return res.status(500).json({
        success: false,
        error: err.message
      });
    }
        
    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
        
    res.json({
      success: true,
      message: 'Customer retrieved successfully',
      data: results[0]
    });
  });
};

// Get customer by phone (useful for parking system)
exports.getCustomerByPhone = (req, res) => {
  const phone = req.params.phone;
    
  Customer.getCustomerByPhone(phone, (err, results) => {
    if (err) {
      console.error('Error getting customer by phone:', err);
      return res.status(500).json({
        success: false,
        error: err.message
      });
    }
        
    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found with this phone number'
      });
    }
        
    res.json({
      success: true,
      message: 'Customer retrieved successfully',
      data: results[0]
    });
  });
};

// Update customer
exports.updateCustomer = (req, res) => {
  const cust_id = req.params.id;
  const { Name, Phone, Gender } = req.body; // Match your database schema

  if (!Name || !Phone) {
    return res.status(400).json({
      success: false,
      message: 'Name and Phone are required'
    });
  }

  // Validate Gender enum
  const validGenders = ['Male', 'Female', 'Other', 'Prefer not to say'];
  if (Gender && !validGenders.includes(Gender)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid Gender. Must be: Male, Female, Other, or Prefer not to say'
    });
  }

  Customer.updateCustomer(cust_id, { Name, Phone, Gender }, (err, result) => {
    if (err) {
      console.error('Error updating customer:', err);
      return res.status(500).json({
        success: false,
        error: err.message
      });
    }
        
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
        
    res.json({
      success: true,
      message: 'Customer updated successfully',
      data: {
        cust_id,
        Name,
        Phone,
        Gender
      }
    });
  });
};

// Delete customer
exports.deleteCustomer = (req, res) => {
  const cust_id = req.params.id;

  Customer.deleteCustomer(cust_id, (err, result) => {
    if (err) {
      console.error('Error deleting customer:', err);
            
      if (err.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(409).json({
          success: false,
          message: 'Cannot delete customer. Customer has associated vehicles.'
        });
      }
            
      return res.status(500).json({
        success: false,
        error: err.message
      });
    }
        
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
        
    res.json({
      success: true,
      message: 'Customer deleted successfully'
    });
  });
};

// Get customer's vehicles
exports.getCustomerVehicles = (req, res) => {
  const cust_id = req.params.id;

  Customer.getCustomerVehicles(cust_id, (err, results) => {
    if (err) {
      console.error('Error getting customer vehicles:', err);
      return res.status(500).json({
        success: false,
        error: err.message
      });
    }
        
    res.json({
      success: true,
      message: 'Customer vehicles retrieved successfully',
      data: results,
      count: results.length
    });
  });
};

// Search customers
exports.searchCustomers = (req, res) => {
  const searchTerm = req.params.term;

  if (!searchTerm || searchTerm.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Search term must be at least 2 characters long'
    });
  }

  Customer.searchCustomers(searchTerm, (err, results) => {
    if (err) {
      console.error('Error searching customers:', err);
      return res.status(500).json({
        success: false,
        error: err.message
      });
    }

    res.json({
      success: true,
      message: 'Search completed successfully',
      data: results,
      count: results.length
    });
  });
};
