// cartModel.js
const db = require('../config/db'); // Adjust the path to your database configuration

const Cart = {
  // Add a product to the cart
  addToCart: async (userId, productId, quantity) => {
    const [result] = await db.execute(
      'INSERT INTO Cart (user_id, product_id, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + ?',
      [userId, productId, quantity, quantity]
    );
    return result.insertId;
  },

  // Get all cart items for a user
  getCartByUserId: async (userId) => {
    const [rows] = await db.execute(
      `SELECT c.id, p.id AS product_id, p.name, p.price, p.image, c.quantity
       FROM Cart c
       JOIN Products p ON c.product_id = p.id
       WHERE c.user_id = ?`,
      [userId]
    );
    return rows;
  },

  // Remove a product from the cart
  removeFromCart: async (userId, productId) => {
    const [result] = await db.execute(
      'DELETE FROM Cart WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );
    return result.affectedRows > 0;
  },

  // Update product quantity in the cart
  updateCartQuantity: async (userId, productId, quantity) => {
    const [result] = await db.execute(
      'UPDATE Cart SET quantity = ? WHERE user_id = ? AND product_id = ?',
      [quantity, userId, productId]
    );
    return result.affectedRows > 0;
  },
};

module.exports = Cart;
