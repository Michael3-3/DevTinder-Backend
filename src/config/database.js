const { default: mongoose } = require('mongoose');
const momgoose = require('mongoose');

const connectDb = async () =>{
    await mongoose.connect("mongodb+srv://mikhel:MongoDBPass123@michaeldata.dixnday.mongodb.net/devTinder");
}
module.exports = connectDb;