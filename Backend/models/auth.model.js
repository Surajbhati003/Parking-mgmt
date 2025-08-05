// models/auth.model.js
const db = require('../config/db.config');

const AuthModel = {
  findUserByEmail: (email, callback) => {
    db.query('SELECT * FROM users WHERE email = ?', [email], callback);
  },

  registerUser: (userData, callback) => {
    const { name, email, phone, password, role } = userData;
    db.query(
      'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone, password, role],
      callback
    );
  }
};

module.exports = AuthModel;
