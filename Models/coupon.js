const mongoose = require("../config/db"); 

const couponSchema = new mongoose.Schema({

  code: {
    type: String,
    unique: true,
    required: true,
  },
  discountType: {
    type: String,
    enum: ['minimumPurchase','firstPurchase'],
    required: true,
  },
  discountValue: {
    type: Number,
    required: true,
  },
  minimumPurchaseAmount: {
    type: Number,
    default: 0,
  },
  validUntil: {
    type: Date,
  },  
  status:{
    type:String,
    enum:['Active','Expired','Not Active']
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isExpired:{
    type:Boolean,
    default:false
  }
});

const Coupon = mongoose.model('coupon', couponSchema);

module.exports = Coupon;
