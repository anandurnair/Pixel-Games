const Users = require("../Models/user");
let userError=require('../controllers/userController')




const userBlocked = async (req, res, next) => {
    try {
        const  userId  = req.session.userId;
        console.log("UserId:",userId)
        const user = await Users.findById(userId);
        console.log('User:', user);

        if (user && user.isBlocked === true) {
            req.session.isLoggedIn = false;
            return res.render('accountBlocked')
        } else {
            next(); 
        }
    } catch (error) {
        // Handle errors: log, send an error response, or execute appropriate error handling
        console.error('Error in userBlocked middleware:', error);
        // You might want to send an error response if something goes wrong
        res.status(500).send('Internal Server Error');
    }
};


module.exports=userBlocked