// // only credentials, not a connection
// module.exports = {
//   HOST:     'sql.freedb.tech',
//   USER:     'freedb_dbms_Parking',
//   PASSWORD: 'SJUD6xMyW&zwb76',
//   DATABASE: 'freedb_Parking_Management_DB'
// };
// Backend/config/db.config.js

// Backend/config/db.config.js
const mysql = require('mysql2');

// Create connection pool with minimal, valid configuration
const pool = mysql.createPool({
    host: 'sql.freedb.tech',
    user: 'freedb_dbms_Parking',
    password: 'SJUD6xMyW&zwb76', // Your password is empty
    database: 'freedb_Parking_Management_DB',
    port: 3306,
    connectionLimit: 10
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