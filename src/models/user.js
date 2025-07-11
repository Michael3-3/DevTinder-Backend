const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        maxLength: [50, "{VALUE} exceeds the maximum length of 50 characters. Please provide a shorter first name."]
    },
    lastName: {
        type: String,
        trim: true,
        lowercase: true,
        maxLength: [50, "{VALUE} exceeds the maximum length of 50 characters. Please provide a shorter last name."]
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            "{VALUE} is not a valid email address. Please provide a valid email address."
        ]
    },
    password: {
        type: String,
        required: true,
        maxLength: 1024, // Good for bcrypt hash
        select: false,
        match: [
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            "{VALUE} is not a valid password. It must be at least 8 characters long and include uppercase, lowercase, number, and special character."
        ]
    },
    age: {
        type: Number,
        min: [8, "Age must be at least 8 years."],
        max: [80, "Age must not exceed 80 years."]
    },
    gender: {
        type: String,
        enum: {
            values: ['male', 'female', 'other'],
            message: "{VALUE} is not a valid gender. Allowed values: 'male', 'female', 'other'."
        }
    }
}, {
    timestamps: true
});

module.exports = model('User', userSchema);
