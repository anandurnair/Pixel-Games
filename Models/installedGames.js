// models/user.js
const mongoose = require("../config/db"); // Import the mongoose connection from db.js

const installedGamesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },

  gameItems: [
    {
      gameId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "games", // Assuming you have a Game model
        required: true,
      },
      gameTitle: {
        type: String,
      },
      gameImage: {
        type: String,
      },
      price: {
        type: Number,
      },
    },
  ],
  
});

const installedGames = mongoose.model("installedGames", installedGamesSchema);

module.exports = installedGames;
