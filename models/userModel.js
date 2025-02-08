const db = require('../config/db');
const bcrypt = require('bcrypt');

const createUser = async ({ id,name, email, phone, password }) => {
  console.log(id,name,email,phone,password);
  
  const hashedPassword = await bcrypt.hash(password, 10);
  const [result] = await db.query(
    'INSERT INTO users (id,name, email, phone, password) VALUES (?,?, ?, ?, ?)',
    [id,name, email, phone, hashedPassword]
  );

  return result;
};

const getUserByEmail = async (email) => {
  const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0];
};

module.exports = { createUser, getUserByEmail };