const mysql = require('mysql');

require('dotenv').config();

const pool = mysql.createPool({
    connectionLimit:10,
    host : process.env.MYSQL_HOST,
    port : process.env.MYSQL_PORT,
    user : process.env.MYSQL_USER,
    password : process.env.MYSQL_PASSWORD,
    database : process.env.MYSQL_DB
});

// const pool = mysql.createPool({
//     connectionLimit:10,
//     host : '127.0.0.1',
//     port : '13306',
//     user : 'root',
//     password : 'Leo150720',
//     database : 'jobs_tracker'
// });

module.exports = pool;