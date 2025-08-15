
const ConnectionRequest = require('../models/connectionRequest');
const User = require('../models/user');
const express = require('express');
const connectionRequestSending = express.Router();
// we are using the router to handle the connection request sending logic
const userAuth = require('../middleware/auth');
// we are using the middleware to authenticate the user
// in this file we handle the connection request sending logic. we have to handle all the edge cases like if the user is already connected or if the request is already sent or if the user is trying to send a request to himself in this the user can either interested or ignore the request
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
        // Check if the request is already sent and the request is different from the current status
        const existingRequest = await ConnectionRequest.findOne({
            sender: userId,
            receiver: resId,   
            status: status 
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
       // check if the record fo the sender and receiver already exists with different status. if it is true update the status
        const existingConnection = await ConnectionRequest.findOne({
            sender: userId,
            receiver: resId,
            status: { $ne: status } // Check if the status is different
        });
        if (existingConnection) {
            existingConnection.status = status; // Update the status
            await existingConnection.save();
            return res.status(200).json({ message: `Connection request status updated to ${status}` });
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

// we are going to build another route to handle the connection request reveiving logic. in this the user can either accept or reject the request. so we we have to update the status accordingly. if the user accept the request update the status to accepted and if the user reject the request update the status to rejected. we also have to handle the edge cases like if the request is already accepted or rejected or if the user is trying to accept or reject a request that is not sent to him.
connectionRequestSending.post('/connectionRequestReceiving/:status/:reqId', userAuth, async (req, res) => {
    try {
        const userId = req.user._id;
        const reqId = req.params.reqId;
        const status = req.params.status;

        // Validate the status
        if (!['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        // Check if the request exists in interseted and updated to accepted or rejected
        const connectionRequest = await ConnectionRequest.findOne(
            { sender: reqId, receiver: userId, status: 'interested' }
        )

        if (!connectionRequest) {
            return res.status(404).json({ message: "Connection request not found or already processed" });
        }
        // Check if the request is already accepted or rejected
        
        // Update the status of the connection request
        connectionRequest.status = status;
        await connectionRequest.save();
        
        res.status(200).json({message: `Connection request ${status} successfully`,});
    } catch (error) {
        console.error("Error processing connection request:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

// we are going to create an api to connections of the user. this will return all the connections of the user. we will also return the user details of the connections
connectionRequestSending.get('/connections', userAuth, async (req, res) => {
    try {
        const userId = req.user._id;
        // Fetch the connections of the user by using the connectionRequest model if the user id either in  sender or receiver field and the status is accepted. lets give the user all the connections that are accepted
        const connections = await ConnectionRequest.find({
            $or: [
                { sender: userId, status: 'accepted' },
                { receiver: userId, status: 'accepted' }
            ]
        }).populate('sender receiver', 'firstName lastName age gender about  profilePicture'); // Populate the sender and receiver fields with user details
        if (connections.length === 0) {
            return res.status(404).json({ message: "No connections found" });
        }

      //  here the response will contain only the details of the other user in the connection. if the user is the sender then the receiver details will be returned and if the user is the receiver then the sender details will be returned
        const userConnections = connections.map(connection => {
            return connection.sender._id.toString() === userId.toString() ? connection.receiver:connection.sender;
        });


        res.status(200).json({
            message: "Connections fetched successfully",
            connections: userConnections
        });
       
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});


// lets create a api to see all the connection request that user get
connectionRequestSending.get('/userConnectionsRequest', userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    console.log(userId)
    // Find all requests where the logged-in user is the receiver
    const connections = await ConnectionRequest.find({
      receiver: userId,
      status: "interested"// or "pending" if you mean requests not yet accepted
    }).populate('sender', 'firstName lastName age gender about profilePicture');

    if (!connections.length) {
      return res.status(404).json({ message: "No connections found bro" });
    }

    // Extract sender details directly
    const senders = connections.map(connection => connection.sender);

    res.status(200).json({
      message: "Incoming connection requests fetched successfully",
      connections: senders
    });

  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
});


module.exports = connectionRequestSending;