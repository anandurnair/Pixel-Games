const Banner = require('../Models/banner')
const bannerController={}
const path = require('path')
const fs = require('fs')
const multer = require('multer');


bannerController.bannerList=async (req,res)=>{
    try{
      const banners = await Banner.find()
      res.render('admin/pages/bannerList',{banners})
    }catch(error){
      console.error("Error in admin login:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
  bannerController.insertBanner=async(req,res)=>{
    try {
        if (req.session.adminLogIn) {
            res.render("admin/pages/insertBanner", { message1: "" });
          } else {
            res.redirect("/adminLogin");
          }
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Internal server error" });
    }
}


bannerController.insertBannerData=async(req,res)=>{
  try {
    const { title } = req.body;
    const imageUrls = '/views/uploads/' + req.file.filename;
  
    const existingBanner = await Banner.findOne({ imageUrls: imageUrls });
  
    if (!existingBanner) {
      const newBanner = new Banner({ title: title, imageUrls: imageUrls });
      await newBanner.save();
      res.redirect('/bannerList');
    } else {
      res.render('admin/pages/insertBanner', { message: "Banner already exists" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}


bannerController.editBanner=async(req,res)=>{
  try {
      if (req.session.adminLogIn) {

          let bannerId = req.query.bannerId
          
          const banner = await Banner.findById(bannerId)
          res.render("admin/pages/editBanner", {banner, message1: "" });
        } else {
          res.redirect("/adminLogin");
        }
  } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Internal server error" });
  }
}
bannerController.editBannerData=async(req,res)=>{
  try {
      if (req.session.adminLogIn) {
        const bannerId = req.query.bannerId;
        const banner = await Banner.findById(bannerId)

        let imageUrls;
        if(req.file){
           imageUrls = '/views/uploads/' + req.file.filename;

        }else{
          imageUrls=banner.imageUrls
        }

        let{title}=req.body
        console.log(imageUrls)
        const updateObject = {title,imageUrls }
        await Banner.findByIdAndUpdate(bannerId,updateObject)
        res.redirect('/bannerList')
        } else {
          res.redirect("/adminLogin");
        }
  } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Internal server error" });
  }
}

bannerController.deactiveBanner=async(req,res)=>{
  try {
    const banner =await Banner.findById(req.params.id)
    banner.isActive=false
    await banner.save()
    res.redirect('/bannerList')
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Internal server error" });
  }
}
bannerController.activeBanner=async(req,res)=>{
  try {
    const banner =await Banner.findById(req.params.id)
    banner.isActive=true
    await banner.save()
    res.redirect('/bannerList')
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Internal server error" });
  }
}
module.exports = bannerController

  