// Mongoose model for user data

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  googleId: String,
  displayName: String,
  email: String,
});

module.exports = mongoose.model('users', UserSchema);
