const Users = require("../Models/user");
let userError=require('../controllers/userController')





const isBlocked = async (req, res, next) => {
    const { userId, email } = req.body;
    console.log("userId:", userId);
    console.log("email:", email);
    
    try {
        const user = await Users.findOne({ $or: [{ email: email }, { _id: userId }] });
        console.log("user:", user);

        if (user && user.isBlocked == true) {
            req.session.blockMessage = true;
            req.session.userError = false;
            res.redirect(`/`);
        } else {
            next();
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = isBlocked;