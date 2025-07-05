const express = require('express');
const app = express();
const [adminAuth,userAuth] = require('./middleware/auth');
app.listen(3001,()=>{
    console.log("Server is running on port 3001");
})


app.use('/admin', adminAuth);

app.get("/admin",(req,res,next)=>{
     //res.send("Hello from DevTinder User");
     try {
     throw new Error("This is an error from the admin route");
     }
     catch (err) {
        res.status(500).send("An error occurred: " + err.message);
     }
     next();
        res.send("Hello from DevTinder admin");
});

// Error handling middleware
app.use('/user', userAuth);

app.get('/user',(req,res)=>{
    throw new Error("This is an error from the user route");
    res.send("Hello from DevTinder ");
});


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!'+err.message);
});
// app.post("/user/:user/:id/:message",(req,res)=>{
//     console.log(req.params);
//     res.send("User created successfully");
// });

// app.use("/user",(req,res)=>{
//     res.send("User route is being used");
// });
// app.use("/home",(req,res)=>{
//     res.send("Hello from DevTinder Backend");
// })
   
// app.use("/api",(req,res)=>{
//     res.send("Hello from DevTinder API");
// });

