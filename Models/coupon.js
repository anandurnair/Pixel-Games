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
  isActive: {
    type: Boolean,
    default: true,
  },
});

const Coupon = mongoose.model('coupon', couponSchema);

module.exports = Coupon;
