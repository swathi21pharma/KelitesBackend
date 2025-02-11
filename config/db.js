const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.RAILWAY_HOST,
  port:  process.env.RAILWAY_PORT,
  user: process.env.RAILWAY_USER,
  password: process.env.RAILWAY_PASSWORD,
  database: process.env.RAILWAY_DB,
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool.promise();
