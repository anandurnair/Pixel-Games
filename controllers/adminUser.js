const Users = require("../Models/user");

const adminUser = {};

adminUser.userList = async (req, res) => {
  try {
    if (req.session.adminLogIn) {
    
      let currentPage = parseInt(req.query.page) || 1;
      const perPage = 8;
      if (currentPage < 1) {
        currentPage = 1; // Reset to 1 if currentPage is less than 1
      }
  
      const skipValue = (currentPage - 1) * perPage;
      const totalUsers = await Users.countDocuments();
      const totalPages = Math.ceil(totalUsers / perPage);
  
      const users = await Users.find().sort({_id:-1})
      .skip(skipValue)
      .limit(perPage);
      res.render("admin/pages/userList", { users, message: "",currentPage, totalPages, });
    } else {
      res.redirect("/adminLogin");
    }
  } catch (error) {
    console.error("Error searching for users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
  
};

adminUser.searchUser = async (req, res) => {
  const { fullName } = req.query;
  try {
    let currentPage = parseInt(req.query.page) || 1;
    const perPage = 8;
    if (currentPage < 1) {
      currentPage = 1; // Reset to 1 if currentPage is less than 1
    }

    const skipValue = (currentPage - 1) * perPage;
    const totalUsers = await Users.countDocuments();
    const totalPages = Math.ceil(totalUsers / perPage);

    const users = await Users.find({
      fullName: new RegExp("^" + fullName, "i"),
    });

    if (req.session.adminLogIn) {
      if (users.length > 0) {
        res.render("admin/pages/userList", { users, message: "",currentPage, totalPages, err: "" });
      } else {
        res.render("admin/pages/userList", {
          users,
          currentPage, totalPages,
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
    console.error("Error searching for users:", error);
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
    console.log(error)
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
