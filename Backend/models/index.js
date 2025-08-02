const express    = require('express');
const cors       = require('cors');
const bodyParser = require('body-parser');

const app  = express();
const PORT = process.env.PORT || 3000;


// db connection setup
const mysql  = require('mysql2');
const config = require('../config/db.config.js');

const connection = mysql.createConnection({
  host:     config.HOST,
  user:     config.USER,
  password: config.PASSWORD,
  database: config.DATABASE
});

connection.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database successfully!');
});

module.exports = connection;
