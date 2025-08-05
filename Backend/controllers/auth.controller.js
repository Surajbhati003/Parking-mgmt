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

  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(401).json({ error: 'User not found' });

    const user = results[0];
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    // Generate JWT
    const token = jwt.sign(
      {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({ message: 'Login successful', token });
  });
};



