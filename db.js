const mongoose = require('mongoose');
require('dotenv').config();
const mongoURI = process.env.DATABASE;

const connectToMongo = () => {
    mongoose.connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    console.log("Connected");
}

module.exports = connectToMongo;