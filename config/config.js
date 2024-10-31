const mongoose = require('mongoose');
const { S3Client } = require('@aws-sdk/client-s3');

require('dotenv').config();

//Connecting to MongoDB
mongoose.connect(process.env.MONGO_URI, {
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Error connecting to MongoDB:', err);
});

//Setting AWS S3
const s3 = new S3Client({
    region: process.env.REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

module.exports = {
    mongoose,
    s3,
}