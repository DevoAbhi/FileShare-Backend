require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = () => {

    mongoose.connect(process.env.MONGODB_CONNECTION_URL, { 
        useNewUrlParser: true, 
        useCreateIndex: true, 
        useUnifiedTopology: true, 
        useFindAndModify: true
    });

    const connection = mongoose.connection;

    connection.once("open", () => {
        console.log("Database connected successfully!")
    }).catch(err => {
        console.log("Connection Failed!")
        console.log(err);
    })
}

module.exports = connectDB;
// EEfHtcO8ZMHJcDtu