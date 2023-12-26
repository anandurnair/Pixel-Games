const mongoose = require("../config/db");



const bannerSchema = new mongoose.Schema({

    title: {
      type: String,
      required: true,
    },
    imageUrls: {
      type: String,
      required: true,
    },
   
    status:{
      type:String,
      enum:['Listed','Unlisted']
    },
    isList: {
      type: Boolean,
      default: true,
    },
   
  });
  
  const Banner = mongoose.model('banner', bannerSchema);
  
  module.exports = Banner;