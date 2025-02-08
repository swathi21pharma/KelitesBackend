const db = require('../config/db');

const createProduct = async ({ id, name, price, description, image }) => {
  const [result] = await db.query(
    'INSERT INTO products (id, name, price, description, image) VALUES (?, ?, ?, ?, ?)',
    [id, name, price, description, image]
  );
  return result.insertId;
};

const getAllProducts = async () => {
  const [rows] = await db.query('SELECT * FROM products');
  return rows;
};

const getProductById = async (id) => {
  const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
  return rows[0];
};

const updateProduct = async (id, { name, price, description, image }) => {
  const [result] = await db.query(
    'UPDATE products SET name = ?, price = ?, description = ?, image = ? WHERE id = ?',
    [name, price, description, image, id]
  );
  return result.affectedRows > 0;
};

module.exports = { createProduct, getAllProducts, getProductById, updateProduct };
