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
        ref: "games",
        required: true,
      },
      orderDate: Date,
      orderStatus: {
        type: String,
        enum: ["Downloaded", "Pending", "Processing"],
        default: "Pending",
      },
    },
  ],
});


const installedGames = mongoose.model("installedGames", installedGamesSchema);

module.exports = installedGames;
