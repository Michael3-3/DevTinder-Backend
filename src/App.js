const express = require('express');
const app = express();
  

app.get("/user",(req,res)=>{
    res.send("Hello from DevTinder User");
});

app.post("/user",(req,res)=>{
    res.send("User created successfully");
});

app.use("/user",(req,res)=>{
    res.send("User route is being used");
});
app.use("/home",(req,res)=>{
    res.send("Hello from DevTinder Backend");
})
   
app.use("/api",(req,res)=>{
    res.send("Hello from DevTinder API");
});

app.listen(3001,()=>{
    console.log("Server is running on port 3001");
})