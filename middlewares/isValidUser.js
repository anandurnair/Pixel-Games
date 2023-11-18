const Users = require("../Models/user");
const bcrypt = require("bcrypt");



const isValidUser=async(req,res,next)=>{
    try {
          
        const {userId, email, password } = req.body;
        const user = await Users.findOne({ $or: [{ email: email }, { _id: userId }] });
        const check=await bcrypt.compare(password, user.password)
        // if(user.isBlocked == true){
        //   blockMessage=true
        //   error=false
        //   return res.redirect('/')
          
        // }
        blockMessage=false
        if ( email === user.email && check ) {
         
          next()
        } else {
          userError = true;
          res.redirect(`/?userError=${userError}`);
        }
      } catch {
        userError = true;
        // res.status(500).json({ error: "Internal server error" });
        return res.redirect(`/?userError=${userError}`);
      }
}


module.exports=isValidUser