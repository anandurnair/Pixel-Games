const Users = require("../Models/user");
let userError=require('../controllers/userController')





const isBlocked = async (req, res, next) => {
    try {
    const userId = req.session.userId;
    console.log("userId:", userId);
   
    
    
        const user = await Users.findById(userId);
        console.log("user:", user);

        

        if (!user) {
            console.log("User not found");
            res.redirect(`/`);
        } else if (user.isBlocked) {
            req.session.blockMessage = true;
            req.session.userError = false;
            res.redirect(`/`);
        } else {
            next();
        }
    } catch (error) {
        console.error(error);
        res.redirect(`/`);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = isBlocked;