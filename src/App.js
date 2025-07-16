const express = require('express');
const connectDb = require('./config/database');
const bcrypt = require('bcrypt');
const User = require('./models/user');
const validate = require('validator');
const { validateSingUp,loginValidation } = require('./middleware/validations');
const userAuth = require('./middleware/auth');
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken');

const app = express();
app.use(cookieParser()); // Middleware to parse cookies
app.use(express.json()); // Middleware to parse JSON bodies

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

 

app.post('/signup',validateSingUp,async (req,res,next)=>{
    
    try {
        const passwordHash = await bcrypt.hash(req.body.password, 10);

        // hash password before saving
        const user = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: passwordHash,
        });
        await user.save();
        console.log("User created successfully:", user);
        res.status(201).send({message: "User created successfully", user});
    } 
    
    
    catch (err) {
        res.status(500).send({message: "Error creating user", error: err});
        
    }
});

app.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    if (!validate.isEmail(email)) {
      throw new Error("Invalid email format");
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isMatch = await user.validatePassword(password);
    if (!isMatch) {
        throw new Error("Invalid credentials");
    }

    console.log("User found:", user);

    // ✅ Generate JWT token with user ID
    const token = user.generateJwt();
    console.log("Generated JWT token:", token);

    // ✅ Set token in cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: true, // Set to false on localhost
      sameSite: 'Strict',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.status(200).send("Login successful!!!");
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send("Error in login: " + error.message);
  }
});



app.get('/profile',userAuth, async (req, res) => {
    try{
        const user = req.user; // User is attached to the request object by the auth middleware
        console.log("User profile:", user);
        res.json(user);
    }
    catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({message: "Internal server error", error: error.message});
    }
});
app.get('/feed',userAuth, async (req, res) =>{
    try{
        // Check if the user is authenticated
        const user = req.user; // User is attached to the request object by the auth middleware
        // Fetch users from the database
        const feed = await User.find({});
        res.send({feed});
        const cookie = req.cookies;
        console.log("Cookies:", cookie);
    }
    catch (error) {
        //console.error("Error fetching users:", error);
        if(error.name === 'JsonWebTokenError'){
            res.status(401).send("Unauthorized access : Invalid token");
        }
        res.status(500).json({message: "Internal server error", error: error.message} );
    }
} );

app.get('/user/:id', async (req, res) => {
    try {
        const user = await User.findOne({email : req.params.id});
        if (!user) {
            return res.status(404).send("User not found");
        }
        res.json(user);
    } catch (error) {
       // console.error("Error fetching user:", error);
        res.status(500).json({message: "Internal server error"});
    }
});


app.delete('/user/:email', async (req, res) => {
    try {
        const user = await User.findOneAndDelete({email : req.params.email});
        if (!user) {
            return res.status(404).send("User not found");
        }
        res.json(user, {message: "User deleted successfully"});
    } catch (error) {
        //console.error("Error deleting user:", error);
        res.status(500).json({message: "Internal server error", error: error.message});
    }
}); 


app.put('/user/:email', async (req, res) => {
    try {
        if(req.body.email && req.body.email !== req.params.email) {
            return res.status(400).json({message: "Email cannot be changed"});// Prevent changing email
        }
        // Validate the request body against the User schema
        const user = await User.findOneAndUpdate({email: req.params.email},req.body,{overwrite:true, new:true , runValidators:true});
        if (!user) {
            return res.status(404).send("User not found");
        }
        res.json({user:user ,message: "User updated successfully"});
    } catch (error) {
        //console.error("Error updating user:", error);
        res.status(500).json({message: "Internal server error", error: error.message});
    }
    });

app.use((err, req, res, next) => {
    
    console.error("Error:", err);
    res.status(500).json({message: "Internal server error", error: err.message});
});