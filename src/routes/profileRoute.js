const express = require('express');
const User = require('../models/user');
const profileRoute = express.Router();
const validate = require('validator');
const bcrypt = require('bcrypt');


//* Middleware to authenticate user
const userAuth = require('../middleware/auth');


profileRoute.get('/profile/view',userAuth, async (req, res) => {
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


profileRoute.patch('/profile/update',userAuth, async (req, res) => {
    try{
        console.log(req.body,req.user);
        const user = req.user;
        // validate the request body is havind editable fields
        const editableFields = ["firstName","lastName", "email", "age","gender","about","profilePicture"];
        isUpdateValid = Object.keys(req.body).every(field=> editableFields.includes(field));
        if(!isUpdateValid){
            throw new Error("Invalid fields in update request");
        }
        // Update user profile
        const updatedUser = await User.findByIdAndUpdate(user._id, req.body, { new: true, runValidators: true });
        if (!updatedUser) {
            return res.status(404).json({message: "invalid update request"});
        }
        res.json(updatedUser);
    }
    catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({message: "Internal server error", error: error.message});
    }
});



profileRoute.patch('/profile/password', async (req, res) => {
    try{
        const {email, newPassword,confirmPassword} = req.body;
        if (!email || !newPassword || !confirmPassword) {
            return res.status(400).json({message: "Current password, new password, and confirm password are required"});
        }
        // user validation
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(404).json({message: "User not found"});
        }
        // validate new password
        if (newPassword !== confirmPassword) {
            return res.status(400).json({message: "New password and confirm password do not match"});
        }
        if (!validate.isStrongPassword(newPassword)) {
            return res.status(400).json({message: "New password is not strong enough"});
        }

        // Hash new password
        const passwordHash = await bcrypt.hash(newPassword, 10);
        // Update user password
        user.password = passwordHash;
        await user.save();  
        res.status(200).json({message: "Password updated successfully"});

    }




    catch (error) {
        console.error("Error updating password:", error);
        res.status(500).json({message: "Internal server error", error: error.message});
    }
});
module.exports = profileRoute;