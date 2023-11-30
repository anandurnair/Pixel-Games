// models/cart.js
const mongoose = require("../config/db");
const Users = require("./user")
const Games = require('./game')

const Schema = mongoose.Schema;


const wishlistSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'user', // Reference to the User model (if you have one)
    required: true,
  },
  items: [{
    gameId:{
      type: Schema.Types.ObjectId,
      ref: 'games', // Reference to the Games model
      required: true,
    }
  }
  ],
});

const Wishlist = mongoose.model("wishlists", wishlistSchema);

module.exports = Wishlist;
