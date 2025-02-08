// server.js
const express = require('express');
const cors =require("cors");
const app = express();
const dotenv = require('dotenv');
dotenv.config(); 
app.use(express.json()); 
app.use(cors());
const userRoutes = require('./routes/userRoutes');
const productsRoutes=require("./routes/productRoutes");
app.use('/api/users', userRoutes);
app.use('/api/products',productsRoutes);
app.use("/",(req,res)=>{
    res.send("server is running");
})
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
