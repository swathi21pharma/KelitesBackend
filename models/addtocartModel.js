// cartModel.js
const db = require('../config/db'); // Adjust the path to your database configuration

const Cart = {
  // Add a product to the cart
  addToCart: async (userId, productId,quantity) => {
    const result = await db.query(
      'INSERT INTO elite_products.cart (user_id, product_id,quantity) VALUES ($1,$2,$3) RETURNING *',
      [userId, productId,quantity]
    );
    return result.rows[0].id;
  },

  // Get all cart items for a user
  getCartByUserId: async (userId) => {

    const result = await db.query(
      `SELECT *
       FROM elite_products.cart 
       WHERE user_id = $1`,
      [userId]
    );
    
   
    return result.rows;
  },

  // Remove a product from the cart
  removeFromCart: async (userId, productId) => {
    const result = await db.query(
      'DELETE FROM elite_products.cart WHERE user_id = $1 AND product_id = $2',
      [userId, productId]
    );
    return result.rowCount > 0;
  },

   updateCartQuantity : async (userId, productId, quantity) => {
    if (!userId || !productId || typeof quantity !== 'number') {
      throw new Error('Invalid input data');
    }
 
    const result = await db.query(
      'UPDATE elite_products.cart SET quantity = $1 WHERE user_id = $2 AND product_id = $3',
      [quantity, userId, productId]
    );
  
    return result.rowCount>=1;
  },
};

module.exports = Cart;
