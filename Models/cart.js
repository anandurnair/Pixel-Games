// models/cart.js
const mongoose = require("../config/db");
const Users = require("./user")
const Games = require('./game')

const Schema = mongoose.Schema;

const cartItemSchema = new Schema({
  gameId: {
    type: Schema.Types.ObjectId,
    ref: 'games', // Reference to the Games model
    required: true,
  },
  gameName: {
    type: String,
    required: true,
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
  },
  unlist: Boolean,
 
});

const cartSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'user', // Reference to the User model (if you have one)
    required: true,
  },
  items: [cartItemSchema],
});

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
