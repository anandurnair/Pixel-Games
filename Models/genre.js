// models/user.js
const mongoose = require("../config/db"); // Import the mongoose connection from db.js

const genreSchema = new mongoose.Schema({
  genreName: {
    type: String,
    unique:true
  },
  unlistGenre:Boolean
});

const Genres = mongoose.model("genre", genreSchema);

module.exports = Genres;
