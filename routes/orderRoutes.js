const express = require("express");
const { createRazorpayOrder, verifyPaymentAndCreateOrder, cancelOrder,getOrdersdetails} = require("../controllers/orderController");

const router = express.Router();

router.post("/create-razorpay-order", createRazorpayOrder);
router.post("/verify-payment", verifyPaymentAndCreateOrder);
router.post("/cancelOrder",cancelOrder);
router.post("/getorders",getOrdersdetails)

module.exports = router;
