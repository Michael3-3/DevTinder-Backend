const { Schema, model } = require('mongoose');
const validate = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

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
        validate(value) {
            if (!validate.isEmail(value)) {
                throw new Error("{VALUE} is not a valid email address.");
            }
        }
    },
    password: {
        type: String,
        required: true,
        maxLength: 1024, // Good for bcrypt hash
        validate(value) {
            if (!validate.isStrongPassword(value)) {
                throw new Error("{VALUE} is not a strong password.");
            }
        }
    },
    age: {
        type: Number,
        min: [8, "Age must be at least 8 years."],
        max: [80, "Age must not exceed 80 years."]
    },
    gender: {
        type: String,
        maxLength: 20,
        enum: {
            values: ['male', 'female', 'other'],
            message: "{VALUE} is not a valid gender. Allowed values: 'male', 'female', 'other'."
        }
    },
    about: {
        type: String,
        maxLength: [500, "{VALUE} exceeds the maximum length of 500 characters. Please provide a shorter bio."],
        default: "No bio provided."
    },
    profilePicture: {
        type: String,
        default: "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png",// Placeholder URL
        validate(value) {
            if (!validate.isURL(value)) {
                throw new Error("{VALUE} is not a valid URL.");
            }
        }
    }
}, {
    timestamps: true
});

userSchema.methods.generateJwt = function() {
    const token = jwt.sign({ id: this._id},'secretKey', { expiresIn: '1d' });
    return token;
}

userSchema.methods.validatePassword = async function(password) {
    const passwordHash = this.password;
    const isPasswordValid = await bcrypt.compare(password,passwordHash); 
    return isPasswordValid;
}

module.exports = model('User', userSchema);
