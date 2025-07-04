const express = require('express');
const app = express();
  
app.use("/home",(req,res)=>{
    res.send("Hello from DevTinder Backend");
})

app.use("/api",(req,res)=>{
    res.send("Hello from DevTinder API");
});

app.listen(3001,()=>{
    console.log("Server is running on port 3001");
})