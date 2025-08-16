const { default: mongoose } = require('mongoose');
const momgoose = require('mongoose');

const connectDb = async () =>{
    await mongoose.connect(process.env.DBConnections);
}
module.exports = connectDb;