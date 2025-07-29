const mysql = require('mysql2');
const connection = mysql.createConnection({
    host:'sql.freedb.tech',
    user: 'freedb_dbmsproject',
    password: 'gdM6n26fRE4!XKe',
    database: 'freedb_dbmsproject'
});

connection.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database');
});


module.exports = connection;
