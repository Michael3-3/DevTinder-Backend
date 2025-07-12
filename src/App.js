const express = require('express');
const connectDb = require('./config/database');

const User = require('./models/user');

const app = express();


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

 
app.use(express.json()); // Middleware to parse JSON bodies
app.post('/signup',async (req,res,next)=>{
    
    try {
        const user = new User(req.body);
        await user.save();
        console.log("User created successfully:", user);
        res.status(201).send({message: "User created successfully", user});
    } catch (err) {
        // Check if it's a validation error
        // if (err.name === 'ValidationError') {
        //     const errors = {};

        //     // Extract all validation messages
        //     for (let field in err.errors) {
        //         errors[field] = err.errors[field].message;
        //     }

        //     return res.status(400).send({
        //         message: 'Validation failed',
        //         errors: errors
        //     });
        // }
        // Handle other errors
        res.status(500).send({message: "Error creating user", error: err});
        
    }
});

app.get('/feed', async (req, res) =>{
    try{
        const users = await User.find({});
        res.send({users});
    }
    catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({message: "Internal server error"});
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
        // if( error.name === 'ValidationError') {
        //     const errors = {};
        //     for (let field in error.errors) {
        //         errors[field] = error.errors[field].message;
        //     }
        //     return res.status(400).json({message: 'Validation failed', errors: errors});
        // }
        res.status(500).json({message: "Internal server error", error: error.message});
    }
    });

app.use((err, req, res, next) => {
    //console.error("Error:", err);
    res.status(500).json({message: "Internal server error"},err);
});