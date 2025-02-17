const db = require('../config/db'); // Your database connection file
const axios = require('axios');
// Create a new order
const createOrder = async (orderData) => {
  const {
    order_id, customer_name, email, phone, address, city, state, payment_id, signature, country, pincode,
    payment_method, shipping_charges, total_amount, weight,
    shipment_id = null, awb_code = null, courier_name = null, order_status = 'pending'
  } = orderData;

 
  const query = `
    INSERT INTO orders (
      order_id, customer_name, email, phone, address, city, state, payment_id, signature,country, pincode, 
      payment_method, shipping_charges, total_amount, weight, 
      shipment_id, awb_code, courier_name, order_status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?, ?, ?, ?, ?, ?,?,?, ?, NOW(), NOW())
  `;

  const values = [
    order_id, customer_name, email, phone, address, city, state, payment_id, signature,country, pincode,
    payment_method, shipping_charges, total_amount, weight, 
    shipment_id, awb_code, courier_name, order_status
  ];

  try {
    const [result] = await db.query(query, values);
    console.log("Order created successfully:", result);
    return result; // Returns the result of the insert query
  } catch (err) {
    console.error("Error during order creation:", err);
    throw err; // Propagate the error
  }
};

// Function to create order items
const createOrderItem = async (orderItemData) => {
  const { order_id, product_id, quantity, price, total_amount } = orderItemData;

  const query = `
    INSERT INTO order_items (order_id, product_id, quantity, price, total_amount)
    VALUES (?, ?, ?, ?, ?)
  `;

  const values = [order_id, product_id, quantity, price, total_amount];

  const [result] = await db.query(query, values);
  return result; // Returns the result of the insert query
};

// Update order details after shipping (like shipment_id, awb_code, courier_name, order_status)
const updateOrder = async (orderId, updateFields) => {
  const {
    shipment_id, awb_code, courier_name, order_status
  } = updateFields;

  try {
    const [result] = await db.query(
      `UPDATE orders SET shipment_id = ?, awb_code = ?, courier_name = ?, order_status = ? 
      WHERE order_id = ?`,
      [shipment_id, awb_code, courier_name, order_status, orderId]
    );
    return result;
  } catch (err) {
    console.error("Error updating order:", err);
    throw err;
  }
};

// Get order by order_id (used for tracking)
const getOrderByOrderId = async (orderId) => {
  try {
    const [rows] = await db.query('SELECT * FROM orders WHERE order_id = ?', [orderId]);
    return rows[0];
  } catch (err) {
    console.error("Error fetching order:", err);
    throw err;
  }
};
const formatDate = (date) => {
  let d = new Date(date);
  let year = d.getFullYear();
  let month = ('0' + (d.getMonth() + 1)).slice(-2); // Months are 0-indexed
  let day = ('0' + d.getDate()).slice(-2);
  let hours = ('0' + d.getHours()).slice(-2);
  let minutes = ('0' + d.getMinutes()).slice(-2);

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}



const createShipRocketOrder = async (order, token) => {
  console.log(order);
  
    try {
      const response = await axios.post(
        "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
        {
         
            "order_id": order.order_id,
            "order_date": formatDate(new Date()),
            "pickup_location": "warehouse",
            "channel_id": "",
            "comment": "Reseller: M/s Goku",
            "billing_customer_name": order.customer_name,
            "billing_last_name": "",
            "billing_address": order.address,
            "billing_address_2": "Near Hokage House",
            "billing_city":order.city,
            "billing_pincode":order.pincode,
            "billing_state":order.state,
            "billing_country":order.country,
            "billing_email": order.email,
            "billing_phone": order.phone,
            "shipping_is_billing": true,
            "shipping_customer_name": "",
            "shipping_last_name": "",
            "shipping_address": "",
            "shipping_address_2": "",
            "shipping_city": "",
            "shipping_pincode": "",
            "shipping_country": "",
            "shipping_state": "",
            "shipping_email": "",
            "shipping_phone": "",
            "order_items": order.order_items.map((item) => ({
              name: item.product_name,
              units: item.quantity,
              sku:item.sku,
              selling_price: item.price,
              discount: item.discount || 0,
              tax: item.tax || 0,
              hsn: item.hsn || 0,
            })),
            "payment_method":order.payment_method || "Prepaid",
            "shipping_charges": 0,
            "giftwrap_charges": 0,
            "transaction_charges": 0,
            "total_discount": 0,
            "sub_total": 9000,
            "length": order.length|| 10,
            "breadth":  order.breadth || 5,
            "height":  order.height || 5,
            "weight":  order.weight || 0.5
          

        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
    
    
  
      const shipmentID = response.data.shipment_id;
      console.log('ShipRocket Order Created:', shipmentID);
  
      // Store the shipment ID in your database
      await saveTracking(order.order_id, shipmentID);
    } catch (error) {
      console.error('Error creating ShipRocket order:', error);
    }
  };
  
  const saveTracking = async (orderID, shipmentID) => {
    try {
      // Update the order with the shipment ID in your database
      await db.query('UPDATE orders SET shipment_id = ? WHERE order_id = ?', [shipmentID, orderID]);
      console.log('Tracking ID saved successfully!');
    } catch (error) {
      console.error('Error saving tracking ID:', error);
    }
  };
  
module.exports = { createOrder, updateOrder, getOrderByOrderId,createShipRocketOrder,saveTracking,createOrderItem};
