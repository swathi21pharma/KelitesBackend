const db = require("../config/db");

// ➤ Add Product to Wishlist
const addToWishlist = async (userId, productId) => {
  console.log(userId,productId);
  
  try {
    const [result] = await db.query(
      "INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)",
      [userId, productId]
    );
    // const [result] = await db.query(
    //   `drop table `
    // );
    return result.insertId;
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    throw error;
  }
};

// ➤ Get Wishlist Items for a User
const getWishlistByUserId = async (userId) => {
  try {
    const [rows] = await db.query(
      `SELECT product_id
        FROM wishlist
        WHERE user_id = ?;`,
      [userId]
    );
    return rows;
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    throw error;
  }
};

// ➤ Remove Product from Wishlist
const removeFromWishlist = async (userId, productId) => {
  console.log(userId);
  
  try {
    const [result] = await db.query(
      "DELETE FROM wishlist WHERE user_id = ? AND product_id = ?",
      [userId, productId]
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    throw error;
  }
};

module.exports = { addToWishlist, getWishlistByUserId, removeFromWishlist };
