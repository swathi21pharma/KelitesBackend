// const mysql = require('mysql2');

// const pool = mysql.createPool({
//   host: process.env.RAILWAY_HOST,
//   port:  process.env.RAILWAY_PORT,
//   user: process.env.RAILWAY_USER,
//   password: process.env.RAILWAY_PASSWORD,
//   database: process.env.RAILWAY_DB,
//   waitForConnections: true,
//   connectionLimit: 10,
// });


// module.exports = pool.promise();


const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.VERCELs_HOST,
  port: process.env.VERCELs_PORT,
  user: process.env.VERCELs_USER,
  password: process.env.VERCELs_PASSWORD,
  database: process.env.VERCELs_DB,
  max: 10, 
  idleTimeoutMillis: 30000, 
  ssl: {
    rejectUnauthorized: false, // Allows SSL connection
  }
});

module.exports = pool;
