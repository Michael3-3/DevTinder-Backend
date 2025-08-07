// here this is the feed route and here we show the cards of the users who are not connnected to the user and we do not show the card if the user is already connected or if he ignored or if he already sent a request
const express = require('express');
const feedRoute = express.Router();
const userAuth = require('../middleware/auth');
const User = require('../models/user');
const ConnectionRequest = require('../models/connectionRequest');


feedRoute.get('/feed', userAuth, async (req, res) => {
    try {
        const userId = req.user._id;
        // let include pagination aswell
        const page = parseInt(req.query.page) || 1; // Default to page 1
        const limit = parseInt(req.query.limit) || 10; // Default to 10
        const skip = (page - 1) * limit;
        // Find all users except the authenticated user
        const users = await User.find({ _id: { $ne: userId } }).skip(skip).limit(limit);

        // Find all connection requests sent by the authenticated user
        const sentRequests = await ConnectionRequest.find({ sender: userId });

        // Find all connection requests received by the authenticated user
        const receivedRequests = await ConnectionRequest.find({ receiver: userId });

        // Filter out users who are already connected, ignored, or have sent a request
        const filteredUsers = users.filter(user => {
            const isConnected = (user.connections || []).map(id => id.toString()).includes(userId.toString());

            const hasSentRequest = sentRequests.some(req => req.receiver.toString() === user._id.toString());
            const hasReceivedRequest = receivedRequests.some(req => req.sender.toString() === user._id.toString());

            return !isConnected && !hasSentRequest && !hasReceivedRequest;
        });
        // return the only flieds neccessary for the feed
        const feed = filteredUsers.map(user => ({
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            profilePicture: user.profilePicture,
            about: user.about
        }));
        res.status(200).json(feed);
    } catch (error) {
        console.error("Error fetching feed:", error);
        res.status(500).json({ message: "Error fetching feed", error });
    }
});


module.exports = feedRoute;