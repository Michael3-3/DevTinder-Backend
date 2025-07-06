const express = require('express');
const connectDb = require('./config/database');

const User = require('./models/user');

const app = express();


connectDb()
            .then(() => {
                console.log("Connected to MongoDB");
                app.listen(3001,()=>{
                console.log("Server is running on port 3001");
                })
            })
            .catch((err) =>{
                console.error("Error connecting to MongoDB:", err);
            });

app.post('/signup',async (req,res,next)=>{
    const user = new User({
        firstName: "stalin",
        lastName: "pottella",
        email: "stalin@pottella.com",
        password: "password1234",
        age: 80,
        number: "1234567890",
        });
    try {
        await user.save();
        res.status(201).json({message: "User created successfully"});
    } catch (error) {   
        console.error("Error creating user:", error);
        res.status(500).json({message: "Internal server error"});
    }
   
});
