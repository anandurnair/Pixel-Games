const Users = require("../Models/user");
const bcrypt = require("bcrypt");

const isValidUser = async (req, res, next) => {
  try {
    const { userId, email, password } = req.body;
    const user = await Users.findOne({
      $or: [{ email: email }, { _id: userId }],
    });
    const check = await bcrypt.compare(password, user.password);

    req.session.blockMessage = false;
    if (email === user.email && check) {
      next();
    } else {
      req.session.userError = true;
      res.redirect(`/`);
    }
  } catch {
    req.session.userError = true;
    // res.status(500).json({ error: "Internal server error" });
    return res.redirect(`/`);
  }
};

module.exports = isValidUser;
