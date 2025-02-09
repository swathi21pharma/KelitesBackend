// cartRoutes.js
const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

router.post('/add', cartController.addToCart);
router.get('/:userId', cartController.getUserCart);
router.delete('/remove', cartController.removeFromCart);
router.put('/update', cartController.updateCartQuantity);

module.exports = router;
