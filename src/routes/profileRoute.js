const express = require('express');

const profileRoute = express.Router();

//* Middleware to authenticate user
const userAuth = require('../middleware/auth');


profileRoute.get('/profile',userAuth, async (req, res) => {
    try{
        const user = req.user; // User is attached to the request object by the auth middleware
        console.log("User profile:", user);
        res.json(user);
    }
    catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({message: "Internal server error", error: error.message});
    }
});


module.exports = profileRoute;