// in this file we handle the connection request sending logic. we have to handle all the edge cases like if the user is already connected or if the request is already sent or if the user is trying to send a request to himself in this the user can either interested or ignore the request
const ConnectionRequest = require('../models/connectionRequest');
const User = require('../models/user');
const express = require('express');
const connectionRequestSending = express.Router();
// we are using the router to handle the connection request sending logic
const userAuth = require('../middleware/auth');
// we are using the middleware to authenticate the user
connectionRequestSending.post('/connectionRequestSending/:status/:resId', userAuth, async (req, res) => {
    try {
        const userId = req.user._id;
        const resId = req.params.resId;
        const status = req.params.status;

        //make sure the status is valid and it should be either interested or ignored
        if (!['interested', 'ignored'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        // Check if the receiver exists
        const receiver = await User.findById(resId);
        if (!receiver) {
            return res.status(404).json({ message: "Receiver not found" });
        }
        // Check if the user is trying to send a request to himself
        if (userId.toString() === resId) {
            return res.status(400).json({ message: "You cannot send a request to yourself" });
        }
        // Check if the request is already sent
        const existingRequest = await ConnectionRequest.findOne({
            sender: userId,
            receiver: resId,
            status: 'pending'
        });
        if (existingRequest) {
            return res.status(400).json({ message: "Connection request already sent" });
        }
        // Check if the user is already connected
        const isConnected = await User.findOne({
            _id: userId,
            connections: { $in: [resId] }
        });
        if (isConnected) {
            return res.status(400).json({ message: "You are already connected with this user" });
        }
        // Create a new connection request
        const connectionRequest = new ConnectionRequest({   
            sender: userId,
            receiver: resId,
            status: status
        });
        // Save the connection request to the database
        await connectionRequest.save();

        res.status(201).json({
            message: `Connection request ${status} successfully`,
            connectionRequest: connectionRequest
        });
    } catch (error) {
        console.error("Error sending connection request:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

