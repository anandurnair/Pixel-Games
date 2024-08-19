// db.js
require('dotenv').config();

const mongoose = require("mongoose");
const uri = process.env.mongoose_uri;

mongoose.connect(uri);
const db = mongoose.connection;

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

db.once("open", function () {
  console.log("Connected to MongoDB");
});

module.exports = mongoose;
