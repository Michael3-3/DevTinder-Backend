// in this model we are hold the data of connection request that is sent by one user to another user it can be accepted or rejected or ingrored or interested 
const { Schema, model } = require('mongoose');

const connectionRequestSchema = new Schema({
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['accepted', 'rejected', 'ignored', 'interested'],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
    });


const ConnectionRequest = model('ConnectionRequest', connectionRequestSchema);
module.exports = ConnectionRequest;
// This model will be used to handle connection requests between users in the application.