const mysql = require('mysql2');
const connection = mysql.createConnection({
    host:'sql.freedb.tech',
    user: 'freedb_dbms_Parking',
    password: 'SJUD6xMyW&zwb76',
    database: 'freedb_Parking_Management_DB'
});

connection.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database');
});


module.exports = connection;
