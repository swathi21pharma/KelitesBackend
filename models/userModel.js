const db = require('../config/db');
const bcrypt = require('bcrypt');

const createUser = async ({ name, email, phone=null, password=null}) => {
  console.log(name,email,phone,password);
  const createdAt = new Date();
  let hashedPassword = null;
  if (password) {
    hashedPassword = await bcrypt.hash(password, 10); // Only hash if password is provided
  }
  const [result] = await db.query(
    'INSERT INTO users (name, email, phone, password,createdAt) VALUES (?,?, ?, ?, ?)',
    [name, email, phone, hashedPassword,createdAt]
  );

  return result;
};

const getUserByEmail = async (email) => {
  const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0];
};

module.exports = { createUser, getUserByEmail };