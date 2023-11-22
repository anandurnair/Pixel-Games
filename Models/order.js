// models/user.js
const mongoose = require("../config/db"); // Import the mongoose connection from db.js

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
  orderStatus: {
    type: String,
    enum: ["pending", "processing", "Downloaded", "canceled"],
    default: "Downloaded",
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
  totalAmount: {
    type: Number,

  },
});

const Orders = mongoose.model("order", orderSchema);

module.exports = Orders;
