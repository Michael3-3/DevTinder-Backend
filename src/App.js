const express = require('express');
const connectDb = require('./config/database');
const bcrypt = require('bcrypt');
const User = require('./models/user');
const { validateSingUp,loginValidation } = require('./middleware/validations');
const userAuth = require('./middleware/auth');
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken');



const app = express(); //* Create an Express application

//* import routes
const authRoute = require('./routes/authRoute');
const profileRoute = require('./routes/profileRoute');
const feedRoute = require('./routes/feed');
const connectionRequestSending = require('./routes/connectionRequest');

//* built-in middlewares
app.use(cookieParser()); // Middleware to parse cookies
app.use(express.json()); // Middleware to parse JSON bodies

//* connetion to MongoDB
connectDb()
            .then(() => {
                console.log("Connected to MongoDB");
                app.listen(3001,()=>{
                console.log("Server is running on port 3001");
                })
            })
            .catch((err) =>{
                console.error("Error connecting to MongoDB:", err);
            });

 
//* Routes
app.use('/', authRoute);
app.use('/', profileRoute);
app.use('/', feedRoute);
app.use('/', connectionRequestSending);


app.use((err, req, res, next) => {
    
    console.error("Error:", err);
    res.status(500).json({message: "Internal server error", error: err.message});
});