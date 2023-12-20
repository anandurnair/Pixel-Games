  // models/user.js
  const mongoose = require("../config/db"); // Import the mongoose connection from db.js

  const gameSchema = new mongoose.Schema({
    gameName: {
      type: String,
      unique:true
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
    gameImages: [{
      type: String,
    }],
    unlist:{
      type:Boolean,
      default:false
    },
    
    gameRate:{
      type:Number,
      default:0
    }
  
    
  });

  const Games = mongoose.model("games", gameSchema);

  module.exports = Games;
