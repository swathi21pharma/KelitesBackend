// server.js
const express = require('express');
const cors =require("cors");
const app = express();
const dotenv = require('dotenv');
dotenv.config(); 
app.use(express.json()); 
app.use(cors());
const db = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const productsRoutes=require("./routes/productRoutes");
const wishlistRoutes=require("./routes/wishlistRoutes");
const addtocartRoutes=require("./routes/cartRoutes");
const orderRoutes=require("./routes/orderRoutes");


app.use('/api/users', userRoutes);
app.use('/api/products',productsRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/addtocart",addtocartRoutes);
app.use("/api/order", orderRoutes);

app.use("/",(req,res)=>{
    res.send("server is running");
})
const createOrdersTable = async () => {
    try {

    const query =`CREATE TABLE IF NOT EXISTS order_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT UNSIGNED NOT NULL,
    product_id INT UNSIGNED NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);
`;
        
     const res=   await db.query(query);
        console.log(res);
    } catch (err) {
        console.error("Error creating Orders table:", err);
    }
};

// createOrdersTable();
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
