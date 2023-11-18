// db.js
const mongoose = require("mongoose");
const uri = "mongodb://localhost:27017/pixel-games";

mongoose.connect(uri);
const db = mongoose.connection;

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

db.once("open", function () {
  console.log("Connected to MongoDB");
});

module.exports = mongoose;
