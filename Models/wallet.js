const mongoose = require("../config/db"); 
const Users = require("./user")


const walletSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user', 
        unique: true
      },
      balance: {
        type: Number,
        default: 0 
      },
  
});

const Wallet = mongoose.model('wallet', walletSchema);

module.exports = Wallet;
