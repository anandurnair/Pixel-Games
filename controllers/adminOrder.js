const adminOrder={}

adminOrder.orders=(req,res)=>{
    if (req.session.adminLogIn) {
        res.render("admin/pages/orders", { users: "" });
      } else {
        res.redirect("/adminLogin");
      }
}




module.exports=adminOrder