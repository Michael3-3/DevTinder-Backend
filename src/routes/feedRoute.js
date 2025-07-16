const express = require('express');

const feedRoute = express.Router();
const User = require('../models/user');
//* Middleware to authenticate user
const userAuth = require('../middleware/auth');

feedRoute.get('/feed',userAuth, async (req, res) =>{
    try{
        // Check if the user is authenticated
        const user = req.user; // User is attached to the request object by the auth middleware
        // Fetch users from the database
        const feed = await User.find({});
        res.send({feed});
    }
    catch (error) {
        //console.error("Error fetching users:", error);
        if(error.name === 'JsonWebTokenError'){
            res.status(401).send("Unauthorized access : Invalid token");
        }
        res.status(500).json({message: "Internal error", error: error.message} );
    }
} );




module.exports = feedRoute;