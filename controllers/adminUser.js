const Users = require("../Models/user");

const adminUser = {};

adminUser.userList = async (req, res) => {
  if (req.session.adminLogIn) {
    const users = await Users.find();
    res.render("admin/pages/userList", { users, message: "" });
  } else {
    res.redirect("/adminLogin");
  }
};

adminUser.searchUser = async (req, res) => {
  const { fullName } = req.query;
  try {
    const users = await Users.find({
      fullName: new RegExp("^" + fullName, "i"),
    });

    if (req.session.adminLogIn) {
      if (users.length > 0) {
        res.render("admin/pages/userList", { users, message: "", err: "" });
      } else {
        res.render("admin/pages/userList", {
          users,
          message: "No users found with that name",
          err: "",
        });
      }
    } else {
      res.redirect("/adminLogin");
    }
  } catch (error) {
    console.error("Error searching for users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

adminUser.insertUser = (req, res) => {
  if (req.session.adminLogIn) {
    res.render("admin/pages/insertUser", { message1: "" });
  } else {
    res.redirect("/adminLogin");
  }
};

adminUser.insertUserData = async (req, res) => {
  try {
    if (req.session.adminLogIn) {
      const { fullName, email, phone, country, password } = req.body;
      const users = await Users.find();
      const newUser = new Users({
        fullName,
        email,
        phone,
        country,
        password,
      });

      const user = await Users.findOne({ email });
      console.log(user);

      if (!user) {
        const savedUser = await newUser.save();
        res.redirect("/insertUser", { message1: "" });
      } else {
        res.render("admin/pages/insertUser", {
          message1: "User already exists",
        });
      }
    } else {
      res.redirect("/insertUser");
    }
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
};

adminUser.editUser = async (req, res) => {
  try {
    if (req.session.adminLogIn) {
      const users = await Users.findById(req.params.id);
      res.render("admin/pages/editUser", { users });
    } else {
      res.redirect("/adminLogin");
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

adminUser.editUserData = async (req, res) => {
  try {
    const { fullName, email, phone, country, password } = req.body;

    // Validate input fields here

    const updatedUser = {
      fullName,
      email,
      phone,
      country,
      password,
    };
    await Users.findByIdAndUpdate(req.params.id, updatedUser);
    res.redirect("/userList");
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

adminUser.blockUser = async (req, res) => {
  if (req.session.adminLogIn) {
    try {
      const user = await Users.findById(req.params.id);
      user.isBlocked = true;
      await user.save();
      res.redirect("/userList"); // Redirect back to the user list page or another suitable page
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.redirect("/adminLogin");
  }
};

adminUser.unblockUser = async (req, res) => {
  if (req.session.adminLogIn) {
    try {
      const user = await Users.findById(req.params.id);
      user.isBlocked = false;
      await user.save();
      res.redirect("/userList"); // Redirect back to the user list page or another suitable page
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.redirect("/adminLogin");
  }
};

module.exports = adminUser;
