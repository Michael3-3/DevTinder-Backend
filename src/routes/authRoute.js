const express = require('express');
const authRoute = express.Router();
const { validateSingUp, loginValidation } = require('../middleware/validations');
const User = require('../models/user');
const bcrypt = require('bcrypt');

authRoute.post('/signup',validateSingUp,async (req,res,next)=>{
    
    try {
        const passwordHash = await bcrypt.hash(req.body.password, 10);

        // hash password before saving
        const user = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: passwordHash,
        });
        await user.save();
        console.log("User created successfully:", user);
        res.status(201).send({message: "User created successfully", user});
    } 
    
    
    catch (err) {
        res.status(500).send({message: "Error creating user", error: err});
        
    }
});



authRoute.post('/login',loginValidation, async (req, res, next) => {
  try {
    
    const user = req.user; // User is attached to the request object by the auth middleware
    console.log("User found:", user);

    // ✅ Generate JWT token with user ID
    const token = user.generateJwt();
    console.log("Generated JWT token:", token);

    // ✅ Set token in cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: true, // Set to false on localhost
      sameSite: 'Strict',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.status(200).send("Login successful!!!");
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send("Error in login: " + error.message);
  }
});



module.exports = authRoute;