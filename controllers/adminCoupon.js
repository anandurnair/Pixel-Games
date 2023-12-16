const adminCoupon={}
const Coupon = require("../Models/coupon");
const Coupons = require("../Models/coupon");

let insertCoupon;
adminCoupon.couponList=async(req,res)=>{
    try {
        if (req.session.adminLogIn) {

            let currentPage = parseInt(req.query.page) || 1;
            const perPage = 8;
            if (currentPage < 1) {
              currentPage = 1; // Reset to 1 if currentPage is less than 1
            }
        
            const skipValue = (currentPage - 1) * perPage;
            const totalCoupon = await Coupon.countDocuments();
            const totalPages = Math.ceil(totalCoupon / perPage);
            
            const coupons = await Coupons.find().sort({_id:-1})
            .skip(skipValue)
            .limit(perPage);

            res.render("admin/pages/couponList", { coupons,currentPage, totalPages, message: "",insertCoupon:false });
          } else {
            res.redirect("/adminLogin");
          }
        
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Internal server error" });
    }
}


adminCoupon.insertCoupon=async(req,res)=>{
    try {
        if (req.session.adminLogIn) {
            res.render("admin/pages/insertCoupon", { message1: "" });
          } else {
            res.redirect("/adminLogin");
          }
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Internal server error" });
    }
}


function generateCouponCode(length) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let couponCode = '';
  
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      couponCode += charset[randomIndex];
    }
  
    return couponCode;
  }
 

adminCoupon.insertCouponData=async(req,res)=>{
    try {
        if (req.session.adminLogIn) {
            const newCouponCode = generateCouponCode(6);
          

            const{discountType,discountValue,minimumPurchaseAmount,validUntil}=req.body
            const coupons=await Coupons.findOne({newCouponCode})
            if(!coupons){

                const newCoupon = new Coupons  ({code: newCouponCode,discountType,discountValue,minimumPurchaseAmount,status:'Active',validUntil: new Date() })
                await newCoupon.save()
                let currentPage = parseInt(req.query.page) || 1;
                const perPage = 8;
                if (currentPage < 1) {
                  currentPage = 1; // Reset to 1 if currentPage is less than 1
                }
            
                const skipValue = (currentPage - 1) * perPage;
                const totalCoupon = await Coupon.countDocuments();
                const totalPages = Math.ceil(totalCoupon / perPage);
                
                const coupons = await Coupons.find().sort({_id:-1})
                .skip(skipValue)
                .limit(perPage);
    
                res.render("admin/pages/couponList", { coupons,currentPage, totalPages, message: "",insertCoupon:true });

            }else{
                res.render("admin/pages/insertCoupon", {
                    message1: "Coupon is already exists",
                  });
            }
          } else {
            res.redirect("/adminLogin");
          }
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Internal server error" });
    }
}

adminCoupon.activeCoupon=async(req,res)=>{
    try {
        const coupon = await Coupons.findById(req.params.id);
        coupon.isActive=true
        coupon.status='Active'
        await coupon.save()
        res.redirect('/couponList')
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Internal server error" });
    }
}
adminCoupon.deactiveCoupon=async(req,res)=>{
    try {
        const coupon = await Coupons.findById(req.params.id);
        coupon.isActive=false;
        coupon.status='Not Active'
        await coupon.save()
        res.redirect('/couponList')
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Internal server error" });
    }
}

adminCoupon.editCoupon=async(req,res)=>{
    try {
        if(req.session.adminLogIn){
            const couponId= req.params.id
            const coupon = await Coupons.findById(couponId)
            res.render('admin/pages/editCoupon',{coupon})
        }else{
            res.redirect("/adminLogin");
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Internal server error" });
    }
}

adminCoupon.editCouponData=async(req,res)=>{
    try {
        const couponId=req.params.id
        const coupon = await Coupons.findById(couponId)
        let{
            discountType,
            discountValue,
            minimumPurchaseAmount,
            
            validUntil
        }=req.body

        



       
        const updateObject = {
            discountType,
            discountValue,
            minimumPurchaseAmount,
           
            validUntil,
            status:'Active',
            isActive:true,
            isExpired:false
          };
    
          await Coupons.findByIdAndUpdate(couponId, updateObject);
          res.redirect('/couponList')
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Internal server error" });
    }
}

 

module.exports = adminCoupon;