const Order = require("../models/Order");
const nodemailer = require("nodemailer");
const Razorpay = require("razorpay");
const crypto = require("crypto");
require("dotenv").config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Step 1: Create Razorpay Order
const createRazorpayOrder = async (req, res) => {   
  try {
    const { amount } = req.body;
    if (!amount) {
      return res.status(400).json({ success: false, message: "Amount is required!" });
    }

    const options = {
      amount: amount * 100, // Convert to paise
      currency: "INR",
      receipt: `order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json({ success: true, order });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ success: false, message: "Error creating Razorpay order", error: error.message });
  }
};

// Step 2: Verify Payment & Store Checkout Details
const verifyPaymentAndCreateOrder = async (req, res) => {
  try {
    const { order_id, payment_id, signature, customer, cartItems, totalAmount } = req.body;
    if (!order_id || !payment_id || !signature || cartItems.length === 0) {
      return res.status(400).json({ success: false, message: "Missing required payment fields or cart is empty!" });
    }

    // Verify Razorpay Payment Signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(order_id + "|" + payment_id)
      .digest("hex");

    if (expectedSignature !== signature) {
      return res.status(400).json({ success: false, message: "Invalid payment signature!" });
    }

    // Save Order in MongoDB
    const newOrder = new Order({
      customer,
      cartItems,    
      totalAmount,
      paymentStatus: "Paid",
      razorpayOrderId: order_id,
      razorpayPaymentId: payment_id,
    });

    await newOrder.save();

    // Nodemailer setup
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email to Customer
    const customerMailOptions = {
      from: process.env.EMAIL_USER,
      to: customer.email,
      subject: "Order Confirmation from Akilesh Store",
      text: `Dear ${customer.name},

Your payment was successful, and your order has been placed!

Order Details:
${cartItems.map(item => `${item.name} - ${item.quantity} x ₹${item.price}`).join("\n")}

Total Amount Paid: ₹${totalAmount}

Thank you for shopping with us!

Best regards,
Akilesh Store`,
    };

    // Email to Store Owner
    const ownerMailOptions = {
      from: process.env.EMAIL_USER,
      to: "krishnamoorthym3009@gmail.com",
      subject: "New Order Received - Akilesh Store",
      text: `Hello,

A new order has been placed.

Customer Name: ${customer.name}
Email: ${customer.email}
Phone: ${customer.phone}

Order Details:
${cartItems.map(item => `${item.name} - ${item.quantity} x ₹${item.price}`).join("\n")}

Total Amount Paid: ₹${totalAmount}

Please process the order accordingly.

Best regards,
Akilesh Store`,
    };

    // Send emails
    await transporter.sendMail(customerMailOptions);
    console.log(`Email sent to customer: ${customer.email}`);

    await transporter.sendMail(ownerMailOptions);
    console.log("Email sent to store owner: seelaikaari123@gmail.com");

    res.status(201).json({ success: true, message: "Order stored, email sent to customer & owner!", order: newOrder });
  } catch (error) {
    console.error("Error during payment verification:", error);
    res.status(500).json({ success: false, message: "Failed to store order.", error: error.message });
  }
};

// Step 3: Get Razorpay Key for Frontend
const getRazorpayKey = (req, res) => {
  res.json({ key: process.env.RAZORPAY_KEY_ID });
};

module.exports = { createRazorpayOrder, verifyPaymentAndCreateOrder, getRazorpayKey };
