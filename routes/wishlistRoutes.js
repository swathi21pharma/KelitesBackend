const express = require("express");
const router = express.Router();
const { addToWishlist, getUserWishlist, removeFromWishlist } = require("../controllers/wishlistController");

// ➤ Add to wishlist
router.post("/add", addToWishlist);

// ➤ Get user's wishlist
router.get("/:userId", getUserWishlist);

// ➤ Remove from wishlist
router.delete("/remove", removeFromWishlist);

module.exports = router;
