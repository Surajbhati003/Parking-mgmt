// // only credentials, not a connection
// module.exports = {
//   HOST:     'sql.freedb.tech',
//   USER:     'freedb_dbms_Parking',
//   PASSWORD: 'SJUD6xMyW&zwb76',
//   DATABASE: 'freedb_Parking_Management_DB'
// };
// Backend/config/db.config.js

// Backend/config/db.config.js

//priyanshu codes from here 
require('dotenv').config();
const mysql = require('mysql2');
// Create connection pool with minimal, valid configuration
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    connectionLimit: process.env.DB_CONNECTION_LIMIT || 10
});

// Test connection function
function testConnection(callback) {
    pool.query('SELECT 1 as test', (err, results) => {
        if (callback) callback(err, results);
    });
}

// Export the pool
module.exports = pool;
module.exports.testConnection = testConnection;