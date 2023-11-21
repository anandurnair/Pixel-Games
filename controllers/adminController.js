const Users = require("../Models/user");
const Games = require("../Models/game");
const Genres = require("../Models/genre");
const multer = require("multer");

const adminController = {};

// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "views", "gameImages")); // Adjust the destination folder as needed
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });
adminController.upload = upload.single("gameImage");

let adminEmail = "anandu123@gmail.com";
let adminPassword = 123;
var adminLogIn;

adminController.login = (req, res) => {
  if (req.session.adminLogIn) {
    res.redirect("/adminDashboard");
  } else {
    res.render("admin/pages/login.ejs");
  }
};

adminController.loginData = (req, res) => {
  try {
    const { email, password } = req.body;

    if (email == adminEmail && password == adminPassword) {
      req.session.adminLogIn = true;
      res.redirect("/adminDashboard");
    } else {
      res.render("admin/pages/login.ejs", {
        err: true,
        message: "Invalid Email / password",
      });
    }
  } catch (error) {
    console.error("Error in admin login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

adminController.dashboard = (req, res) => {
  if (req.session.adminLogIn) {
    res.render("admin/pages/index");
  } else {
    res.redirect("/adminLogin");
  }
};

adminController.adminLogout = (req, res) => {
  req.session.adminLogIn = false;
  res.redirect("/adminLogin");
};

module.exports = adminController;
