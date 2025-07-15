const User = require('../models/user');
const jwt = require('jsonwebtoken');

const userAuth = (req,res,next) =>{
    const token = req.cookies.token;
    if (!token) {
        throw new Error("Unauthorized access bro: No token provided");
    }
    const decoded = jwt.verify(token, 'secretKey');
    if (!decoded) {
        throw new Error("Unauthorized access: Invalid token");
    }
    const user = User.findById(decoded.id);
    if (!user) {
        throw new Error("Unauthorized access: User not found");
    }
    console.log("Decoded : ", decoded);
    req.user = user; // Attach user to request object
    next();
};




module.exports = [userAuth];