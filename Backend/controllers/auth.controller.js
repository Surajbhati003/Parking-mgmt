const db = require('../config/db.config');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();




// REGISTER
exports.register = (req, res) => {
  const { name, email, phone, password, role } = req.body;

  if (!name || !email || !password || !role || !phone) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Hash password
  const hashedPassword = bcrypt.hashSync(password, 10);

  db.query(
    'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
    [name, email, phone, hashedPassword, role],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'User registered successfully' });
    }
  );
};

// LOGIN
exports.login = (req, res) => {
  const { email, password } = req.body;

  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], async (err, results) => {
    if (err) {
      console.error('Database query error:', err); 
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = results[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  });
};


// reset password
exports.resetPassword = (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ message: 'Email and new password are required' });
  }

  const saltRounds = 10;
  bcrypt.hash(newPassword, saltRounds, (err, hashedPassword) => {
    if (err) return res.status(500).json({ message: 'Error hashing password' });

    // Update user's password
    const query = 'UPDATE users SET password = ? WHERE email = ?';
    db.query(query, [hashedPassword, email], (err, result) => {
      if (err) return res.status(500).json({ message: 'Database error' });

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ message: 'Password reset successful' });
    });
  });
};

