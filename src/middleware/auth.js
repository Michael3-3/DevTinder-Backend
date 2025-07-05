const adminAuth = (req, res, next) => {
    const key = "abc"
    const rev = key === "abc";
    if (rev) {
        console.log("Authentication successful");
        next();
    } else {
        console.log("Authentication failed");
        res.status(401).send("Unauthorized");
    }
};

const userAuth = (req,res,next) =>{
    const key = "user123";
    const rev = key === "user123";
    if (rev) {
        console.log("Authentication successful");
        next();
    } else {
        console.log("Authentication failed");
        res.status(401).send("Unauthorized");
    }
};




module.exports = [adminAuth,userAuth];