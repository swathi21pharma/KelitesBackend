// cartModel.js
const db = require('../config/db'); // Adjust the path to your database configuration

const Cart = {
  // Add a product to the cart
  addToCart: async (userId, productId) => {
    const [result] = await db.execute(
      'INSERT INTO cart (user_id, product_id) VALUES (?, ?)',
      [userId, productId]
    );
    return result.insertId;
  },

  // Get all cart items for a user
  getCartByUserId: async (userId) => {
    const [rows] = await db.execute(
      `SELECT *
       FROM cart 
       WHERE user_id = ?`,
      [userId]
    );
    return rows;
  },

  // Remove a product from the cart
  removeFromCart: async (userId, productId) => {
    const [result] = await db.execute(
      'DELETE FROM cart WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );
    return result.affectedRows > 0;
  },

  // Update product quantity in the cart
  updateCartQuantity: async (userId, productId, quantity) => {
    const [result] = await db.execute(
      'UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?',
      [quantity, userId, productId]
    );
    return result.affectedRows > 0;
  },
};

module.exports = Cart;
