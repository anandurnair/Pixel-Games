const Users = require("../Models/user");
let userError=require('../controllers/userController')





const userBlocked= async(req,res,next)=>{
    const {userId, email } = req.body;
    const user = await Users.findOne({ $or: [{ email: email }, { _id: userId }] });
    console.log(user)
    if(user && user.isBlocked==true){
        req.session.blockMessage=true
        req.session.userError=false
        res.redirect(`/`)
    }else{
        
        next()
    }
}

module.exports=userBlocked