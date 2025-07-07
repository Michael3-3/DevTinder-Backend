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
    const user = new User(req.body);
    try {
        await user.save();
        console.log("User created successfully:", user);
        res.status(201).send({message: "User created successfully", user});
    } catch (error) {   
        console.error("Error creating user:", error);
        res.status(500).send(json({message: "Internal server error"}));
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
        console.error("Error fetching user:", error);
        res.status(500).json({message: "Internal server error"});
    }
});
