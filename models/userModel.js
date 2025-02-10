const db = require('../config/db');
const bcrypt = require('bcrypt');

const createUser = async ({ name, email, phone=null, password=null}) => {
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
const updateUserById = async (id, updatedFields) => {

  const result = await db.query(
    'UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?',
    [updatedFields.name, updatedFields.email, updatedFields.phone, id]
  );

  const updatedUser = await getUserById(id);
  return updatedUser;
};

const getUserById = async (id) => {
  const result = await db.query('SELECT * FROM users WHERE id = ?', [id]);
  return result[0];
};

module.exports = { createUser, getUserByEmail,updateUserById,getUserById};