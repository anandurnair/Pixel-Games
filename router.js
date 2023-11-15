const express = require("express");
const router = express.Router();
const Users = require("./Models/user");
const Games = require("./Models/game");
const Genres = require("./Models/genre");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const accountSid = "ACdbff5c74f03399ff963c51458f20dc6e";
const authToken = "55689063dfb44a194f3cd6c7392d9b7e";
const verifySid = "VAba4bafa31ae3ed26ea5f19d7228c98d1";
const client = require("twilio")(accountSid, authToken);

// const generateOTP = () => {
//   return Math.floor(1000 + Math.random() * 9000).toString();
// };

const sendOTP = (phoneNumber) => {


  try {

    client.validationRequests.create({
      friendlyName: 'My Phone Number',
      phoneNumber: `+91${phoneNumber}`,  // Replace with the phone number you want to verify
    })
    .then(validation_request => console.log(validation_request.sid))
    .catch(error => console.error(error));

    console.log(phoneNumber);
    client.verify.v2
      .services(verifySid)
      .verifications.create({ to: `+91${phoneNumber}`, channel: "sms" })
      .then((verification) => console.log(verification.status)).catch((err)=>console.log(err))
  } catch (error) {
    console.log(error)
  }

    // .then(() => {
    //   const readline = require("readline").createInterface({
    //     input: process.stdin,
    //     output: process.stdout,
    //   });
    // });
};

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

var isLoggedIn;
var fullName;
var error = false;

//login
router.get("/", (req, res) => {
  if (req.session.isLoggedIn) {
    res.redirect("/home");
  } else {
    res.render("user-login", { error });
  }
});
router.post("/loginData", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Users.findOne({ email: email });

    if (
      email === user.email &&
      password == user.password &&
      user.isBlocked == false
    ) {
      req.session.isLoggedIn = true;
      error = false;
      res.redirect("/home");
    } else {
      error = true;
      res.redirect("/");
    }
  } catch {
    error = true;
    // res.status(500).json({ error: "Internal server error" });
    res.redirect("/");
  }
});

// signup

router.get("/signup", (req, res) => {
  if (req.session.isLoggedIn) {
    res.redirect("/home");
  } else {
    res.render("user-signup");
  }
});
router.post("/signupData", async (req, res) => {

  try {
    if (req.session.isLoggedIn) {
      res.redirect("/home");
    } else {
  
      
      const { fullName, email, phone, password } = req.body;
      // const newUser = new Users({ fullName, email, phone,password });
      // const savedUser = await newUser.save();
      req.session.isLoggedIn = true;
  
      const phoneNumber = req.body.phone;
      // const otp = generateOTP();
      sendOTP(phoneNumber);
      res.render("otp", { fullName, email, phone, password, error: "" });
    }
  } catch (error) {
    console.log(error)
  }
 
});

//otp
router.post("/otpData", async (req, res) => {
  try {
    const { fullName, email, phone, password, otpCode } = req.body;

    const verification_check = await client.verify.v2
      .services(verifySid)
      .verificationChecks.create({ to: `+91${phone}`, code: otpCode });

    console.log(verification_check.status);

    const newUser = new Users({ fullName, email, phone, password });
    const savedUser = await newUser.save();

    res.redirect("/home");
  } catch (err) {
    res.render("/user/otp", { error: "Incorrect OTP" });
  }
});

// home

router.get("/home", async (req, res) => {
  if (req.session.isLoggedIn) {
    const games = await Games.find();
    const genres = await Genres.find();
    res.render("home", { games, genres });
  } else {
    res.redirect("/");
  }
});

//game details
// router.get("/gameDetails1/:id", async (req, res) => {
//   try {
//     if (req.session.isLoggedIn) {
//       const game = await Games.findById(req.params.id);
//       res.render("gameDetails1", { game });
//     } else {
//       res.redirect("/");
//     }
//   } catch (error) {
//     res.status(500).json({ error: "Internal server error" });
//   }
// });


router.get("/gameDetails/:id", async (req, res) => {
  try {
    if (req.session.isLoggedIn) {
      const game = await Games.findById(req.params.id);
      res.render("gameDetails", { game });
    } else {
      res.redirect("/");
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

//logout
router.get("/logout", (req, res) => {
  req.session.isLoggedIn = false;
  res.redirect("/");
});

//ADMIN
let adminEmail = "anandu123@gmail.com";
let adminPassword = 123;
var adminLogIn;

//adminlogin

router.get("/adminLogin", (req, res) => {
  if (req.session.adminLogIn) {
    res.redirect("/adminDashboard");
  } else {
    res.render("admin/pages/login.ejs");
  }
});

router.post("/adminLoginData", (req, res) => {
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
});

// admin dashboard

router.get("/adminDashboard", (req, res) => {
  if (req.session.adminLogIn) {
    res.render("admin/pages/index");
  } else {
    res.redirect("/adminLogin");
  }
});

//USER

//user list

router.get("/userList", async (req, res) => {
  if (req.session.adminLogIn) {
    const users = await Users.find();
    res.render("admin/pages/userList", { users, message: "" });
  } else {
    res.redirect("/adminLogin");
  }
});

//search User

router.get("/searchUser", async (req, res) => {
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
          message: "No users found with that username",
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
});

//  insert user

router.get("/insertUser", async (req, res) => {
  if (req.session.adminLogIn) {
  } else {
    res.redirect("/adminLogin");
  }
  res.render("admin/pages/insertUser");
});

router.post("/insertUserData", async (req, res) => {
  if (req.session.adminLogIn) {
  } else {
    res.redirect("/adminLogin");
  }
  const { fullName, userName, email, phone, country, password } = req.body;
  const users = await Users.find();
  const newUser = new Users({
    fullName,
    userName,
    email,
    phone,
    country,
    password,
  });
  newUser
    .save()
    .then(() => {
      res.render("admin/pages/insertUser");
    })
    .catch((err) => {
      console.log(err);
    });
});

//edit user

router.get("/editUser/:id", async (req, res) => {
  if (req.session.adminLogIn) {
  } else {
    res.redirect("/adminLogin");
  }
  try {
    const users = await Users.findById(req.params.id);
    res.render("admin/pages/editUser", { users });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});
router.post("/editUser/:id", async (req, res) => {
  try {
    await Users.findByIdAndUpdate(req.params.id, req.body);
    res.redirect("/userList");
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Block a user
router.get("/block/:id", async (req, res) => {
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
});

// Unblock a user
router.get("/unblock/:id", async (req, res) => {
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
});

//GAME

//game list

router.get("/gameList", async (req, res) => {
  if (req.session.adminLogIn) {
  } else {
    res.redirect("/adminLogin");
  }
  const games = await Games.find();
  res.render("admin/pages/gameList", { games, message: "" });
});

//search game

router.get("/searchGame", async (req, res) => {
  const { gameName } = req.query;
  try {
    const games = await Games.find({
      gameName: new RegExp("^" + gameName, "i"),
    });

    if (req.session.adminLogIn) {
      if (games.length > 0) {
        res.render("admin/pages/gameList", { games, message: "", err: "" });
      } else {
        res.render("admin/pages/gameList", {
          games,
          message: "No users found with that game name",
          err: "",
        });
      }
    } else {
      res.redirect("/adminLogin");
    }
  } catch (error) {
    console.error("Error searching for games:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//  insert game
router.get("/insertGame", (req, res) => {
  if (req.session.adminLogIn) {
  } else {
    res.redirect("/adminLogin");
  }
  res.render("admin/pages/insertGame");
});

router.post("/insertGameData", upload.single("gameImage"), async (req, res) => {
  try {
    const {
      gameName,
      description,
      genre,
      price,
      released,
      publisher,
      gameSize,
    } = req.body;

    const croppedImageData = JSON.parse(req.body.croppedImageData);

    // Construct the image URL based on the destination folder and filename
    const gameImage = req.file ? `/views/gameImages/${req.file.filename}` : "";

    // Create a new game instance
    const newGame = new Games({
      gameName,
      description,
      genre,
      price,
      released,
      publisher,
      gameSize,
      gameImage,
      croppedImageData
    });

    // Save the game to the database
    await newGame.save();

    if (req.file) {
      const imagePath = path.join(__dirname, "views", "gameImages", req.file.filename);
      fs.unlinkSync(imagePath);
    }

    // Render the insertGame page
    res.render("admin/pages/insertGame");
  } catch (error) {
    console.error(error);

    // Handle the error and render an error page
    res.status(500).render("error", { error: "Internal Server Error" });
  }
});

//edit games
router.get("/editGame/:id", async (req, res) => {
  if (req.session.adminLogIn) {
  } else {
    res.redirect("/adminLogin");
  }
  try {
    const game = await Games.findById(req.params.id);
    res.render("admin/pages/editGame", { game });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});
router.post("/editGame/:id", upload.single("gameImage"), async (req, res) => {
  try {
    const gameId = req.params.id;

    // Get other details from the request body
    const {
      gameName,
      description,
      genre,
      price,
      released,
      publisher,
      gameSize,
    } = req.body;

    // Check if a new image was uploaded
    const gameImage = req.file ? `/views/gameImages/${req.file.filename}` : undefined;

    // Prepare the update object with the fields that are provided
    const updateObject = {
      gameName,
      description,
      genre,
      price,
      released,
      publisher,
      gameSize,
    };

    // If a new image is provided, add it to the update object
    if (gameImage !== undefined) {
      updateObject.gameImage = gameImage;
    }

    // Update the game details in the database
    await Games.findByIdAndUpdate(gameId, updateObject);

    res.redirect("/gameList");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});


//genre list
router.get("/genreList", async (req, res) => {
  if (req.session.adminLogIn) {
  } else {
    res.redirect("/adminLogin");
  }
  const genres = await Genres.find();
  res.render("admin/pages/genreList", { genres, message: "" });
});

//search game

router.get("/searchGenre", async (req, res) => {
  const { genreName } = req.query;
  try {
    const genre = await Genres.find({
      genreName: new RegExp("^" + genreName, "i"),
    });

    if (req.session.adminLogIn) {
      if (genre.length > 0) {
        res.render("admin/pages/gameList", { genre, message: "", err: "" });
      } else {
        res.render("admin/pages/gameList", {
          genre,
          message: "No users found with that genre name",
          err: "",
        });
      }
    } else {
      res.redirect("/adminLogin");
    }
  } catch (error) {
    console.error("Error searching for genre:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//  insert genre
router.get("/insertGenre", (req, res) => {
  if (req.session.adminLogIn) {
  } else {
    res.redirect("/adminLogin");
  }
  res.render("admin/pages/insertGenre");
});
router.post("/insertGenreData", async (req, res) => {
  const { genreName } = req.body;
  const genres = await Genres.find();
  const newGenre = new Genres({
    genreName,
  });
  newGenre
    .save()
    .then(() => {
      res.render("admin/pages/insertGenre");
    })
    .catch((err) => {
      console.log(err);
    });
});

//edit genre

router.get("/editGenre/:id", async (req, res) => {
  if (req.session.adminLogIn) {
  } else {
    res.redirect("/adminLogin");
  }
  try {
    const genre = await Genres.findById(req.params.id);
    res.render("admin/pages/editGenre", { genre });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});
router.post("/editGenre/:id", async (req, res) => {
  try {
    await Genres.findByIdAndUpdate(req.params.id, req.body);
    res.redirect("/genreList");
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

//orders

router.get("/orders", (req, res) => {
  if (req.session.adminLogIn) {
  } else {
    res.redirect("/adminLogin");
  }
  res.render("admin/pages/orders", { users: "" });
});

//Admin Logout
router.get("/adminLogout", (req, res) => {
  req.session.adminLogIn = false;
  res.redirect("/adminLogin");
});

module.exports = router;
