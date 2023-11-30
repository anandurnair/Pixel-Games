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
  }

 
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
