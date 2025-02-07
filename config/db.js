const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'autorack.proxy.rlwy.net',
  port: 52145,
  user: 'root',
  password: 'ruaLuDsiQobbarMDojLRjZQNhGgPjIbs',
  database: 'railway',
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool.promise();
