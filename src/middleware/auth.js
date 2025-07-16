const User = require('../models/user');
const jwt = require('jsonwebtoken');

const userAuth =async (req,res,next) =>{
    try{
    const token = req.cookies.token;
    if (!token) {
        throw new Error("Unauthorized access bro: No token provided");
    }
    const decoded =await jwt.verify(token, 'secretKey');
    if (!decoded) {
        throw new Error("Unauthorized access: Invalid token");
    }
    const user =await  User.findById(decoded.id);
    if (!user) {
        throw new Error("Unauthorized access: User not found");
    }
    req.user = user; // Attach user to request object
    next();
}
catch(err){
    res.status(401).json({message:err.message})
    }
};




module.exports = [userAuth];