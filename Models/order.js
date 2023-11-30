// models/user.js
const mongoose = require("../config/db"); // Import the mongoose connection from db.js

const orderSchema = new mongoose.Schema({
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
      orderDate: Date,
      orderStatus: {
        type: String,
        enum: ["Downloaded", "Pending", "Processing"],
        default: "Pending",
      },
    },
  ],
  // totalAmount: {
  //   type: Number,
  // },
 
});

const Orders = mongoose.model("order", orderSchema);

module.exports = Orders;
