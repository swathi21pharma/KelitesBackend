const express = require("express");
const { createRazorpayOrder, verifyPaymentAndCreateOrder, getRazorpayKey } = require("../controllers/orderController");

const router = express.Router();

router.post("/create-razorpay-order", createRazorpayOrder);
router.post("/verify-payment", verifyPaymentAndCreateOrder);
router.get("/get-razorpay-key", getRazorpayKey);

module.exports = router;
