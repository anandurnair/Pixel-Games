const Users = require("../Models/user");
const Games = require("../Models/game");
const Genres = require("../Models/genre");
const multer = require("multer");
const path =require('path')
const adminController = {};

// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join( "views", "gameImages")); // Adjust the destination folder as needed
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  }
  
});

const upload = multer({ storage: storage });
adminController.upload = upload.array("gameImage",3);
adminController.upload2 = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
  
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error("Only image files are allowed!"));
    }
    cb(null, true);
  },
}).array("gameImage", 3); 

let adminEmail = "anandu123@gmail.com";
let adminPassword = 123;
var adminLogIn;

adminController.login = (req, res) => {
  try {
    if (req.session.adminLogIn) {
      res.redirect("/adminDashboard");
    } else {
      res.render("admin/pages/login.ejs");
    }
  } catch (error) {
    console.error("Error in admin login:", error);
    res.status(500).json({ error: "Internal server error" });
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
  try {
    if (req.session.adminLogIn) {
      res.render("admin/pages/index");
    } else {
      res.redirect("/adminLogin");
    }
  } catch (error) {
    console.error("Error in admin login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
 
};

adminController.adminLogout = (req, res) => {
  try {
    req.session.adminLogIn = false;
    res.redirect("/adminLogin");
  } catch (error) {
    console.error("Error in admin login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
 
};

module.exports = adminController;
