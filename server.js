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
const createForeignKey = async () => {
    try {
        // 1. Modify the user_id column to be the same data type as id in the users table (int unsigned)
        const modifyColumnQuery = `
            ALTER TABLE orders
            MODIFY COLUMN user_id INT UNSIGNED;
        `;

        // 2. Add foreign key constraint for user_id referencing id in users table
        const addForeignKeyQuery = `
            ALTER TABLE orders
            ADD CONSTRAINT fk_user_id
            FOREIGN KEY (user_id) REFERENCES users(id);
        `;

        // Execute the queries
        await db.query(modifyColumnQuery);
        await db.query(addForeignKeyQuery);

        console.log("Foreign key constraint added to orders table.");
    } catch (err) {
        console.error("Error creating foreign key:", err);
    }
};

// createForeignKey();
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
