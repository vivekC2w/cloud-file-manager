// TODO: Configuration for MongoDB, cloud storage, etc.

const mongoose = require('mongoose');
const AWS = require('aws-sdk');

require('dotenv').config();

//Connecting to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Error connecting to MongoDB:', err);
});

//Setting AWS S3