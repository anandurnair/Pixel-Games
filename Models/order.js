// models/user.js
const mongoose = require("../config/db"); // Import the mongoose connection from db.jsc
const crypto = require('crypto')

const generateToken = () => {
  return crypto.randomBytes(16).toString('hex');
};


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
      downloadToken: {
        type: String,
        default: generateToken,
      },
      downloadLimit: {
        type: Number,
        default: 1, 
      }
     
    },
  ],
  orderDate: Date,
  orderStatus: {
    type: String,
    enum: ["Downloaded", "Pending", "Processing"],
    default: "Pending"
  },
  paymentMethod:{
    type:String
  },
  totalAmount: {
    type: Number,
  },
  discountValue:{
    type:Number,
    default:0,
  },
  
 
});

const Orders = mongoose.model("order", orderSchema);

module.exports = Orders;
