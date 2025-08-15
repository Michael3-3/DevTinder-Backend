const express = require('express');
const User = require('../models/user');
const profileRoute = express.Router();
const validate = require('validator');
const bcrypt = require('bcrypt');

//* Middleware to authenticate user
const userAuth = require('../middleware/auth');

// =========================
// View Profile
// =========================
profileRoute.get('/profile/view', userAuth, async (req, res) => {
    try {
        const user = req.user; // set by auth middleware
        res.json(user);
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

// =========================
// Update Profile
// =========================
profileRoute.patch('/profile/update', userAuth, async (req, res) => {
    try {
        const user = req.user;
        const editableFields = ["firstName", "lastName", "email", "age", "gender", "about", "profilePicture"];

        // 1. Check for invalid fields
        const isUpdateValid = Object.keys(req.body).every(field => editableFields.includes(field));
        if (!isUpdateValid) {
            return res.status(400).json({ message: "One or more fields cannot be updated" });
        }

        // 2. Required fields validation
        if (!user.firstName || !user.email) {
            return res.status(400).json({ message: "First name and email are required" });
        }

        // 3. Email validation
        if (!validate.isEmail(user.email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        // 4. Age validation
        if (req.body.age && (req.body.age < 0 || req.body.age > 120)) {
            return res.status(400).json({ message: "Invalid age" });
        }

        // 5. Gender validation
        if (req.body.gender && !["male", "female", "other"].includes(req.body.gender.toLowerCase())) {
            return res.status(400).json({ message: "Invalid gender value" });
        }

        // 6. Update user
        const updatedUser = await User.findByIdAndUpdate(user._id, req.body, {
            new: true,
            runValidators: true
        });

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(updatedUser);
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
});

// =========================
// Update Password
// =========================
profileRoute.patch('/profile/password', async (req, res) => {
    try {
        const { email, newPassword, confirmPassword } = req.body;

        // 1. Required fields
        if (!email || !newPassword || !confirmPassword) {
            return res.status(400).json({ message: "Email, new password, and confirm password are required" });
        }

        // 2. Find user
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 3. Password match check
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "New password and confirm password do not match" });
        }

        // 4. Password strength check
        if (!validate.isStrongPassword(newPassword)) {
            return res.status(400).json({
                message: "Password must be at least 8 characters long, contain uppercase, lowercase, number, and special character"
            });
        }

        // 5. Update password
        const passwordHash = await bcrypt.hash(newPassword, 10);
        user.password = passwordHash;
        await user.save();

        res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        console.error("Error updating password:", error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
});

module.exports = profileRoute;
