// models/user.js
const mongoose = require("../config/db"); // Import the mongoose connection from db.js

const gameSchema = new mongoose.Schema({
  gameName: {
    type: String,
  },
  description: {
    type: String,
  },
  genre: {
    type: String,
  },
  price: {
    type: String,
  },
  released: {
    type: Date,
  },
  publisher: {
    type: String,
  },
  gameSize: {
    type: String,
  },
  gameImage: {
    type: String,
  }
  
});

const Games = mongoose.model("games", gameSchema);

module.exports = Games;
