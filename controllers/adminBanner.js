const adminBanner={}

adminBanner.bannerList=async (req,res)=>{
    try{
      res.render('admin/pages/bannerList')
    }catch(error){
      console.error("Error in admin login:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }


module.exports = adminBanner
  