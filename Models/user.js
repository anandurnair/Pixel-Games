// models/user.js
const mongoose = require("../config/db"); // Import the mongoose connection from db.js

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
  },
  userName: {
    type: String,
    unique: true,
  },
  email: {
    type: String,
    unique: true,
  },
  country: {
    type: String,
  },
  phone: {
    type: String,
    unique: true,
  },
  password: String,

  isBlocked: {
    type: Boolean,
    default: false,
  }
 
});

const Users = mongoose.model("users", userSchema);

module.exports = Users;
