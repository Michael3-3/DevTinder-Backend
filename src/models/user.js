const { Schema, model } = require('mongoose'); // Importing Schema and model from mongoose
const userSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    age:{
        type:Number
    },
    gender: {
        type: String,
    }
})

module.exports = model('user',userSchema);  //* This code defines a Mongoose schema and model for a user in a MongoDB database.