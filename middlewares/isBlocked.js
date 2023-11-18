const Users = require("../Models/user");
let userError=require('../controllers/userController')





const userBlocked= async(req,res,next)=>{
    const {userId, email } = req.body;
    const user = await Users.findOne({ $or: [{ email: email }, { _id: userId }] });
    console.log(user)
    if(user && user.isBlocked==true){
        blockMessage=true
        userError=false
        res.redirect(`/?blockMessage=${blockMessage}&userError=${userError}`)
    }else{
        
        next()
    }
}

module.exports=userBlocked