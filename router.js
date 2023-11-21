const express = require("express");
const router = express.Router();
const Users = require("./Models/user");
const Games = require("./Models/game");
const Genres = require("./Models/genre");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

const userController = require("./controllers/userController");
const homeController = require("./controllers/homeController");
const adminController = require("./controllers/adminController");
const adminUser = require("./controllers/adminUser");
const adminGame = require("./controllers/adminGame");
const adminGenre = require("./controllers/adminGenre");
const adminOrder = require("./controllers/adminOrder");


//middlewares


const isBlocked= require('./middlewares/isBlocked');
const userBlocked = require("./middlewares/isBlocked");
const isValidUser = require('./middlewares/isValidUser');
const { AddOnResultContext } = require("twilio/lib/rest/api/v2010/account/recording/addOnResult");


//login
router.get("/",userBlocked, userController.Login);
router.post("/loginData",isValidUser,userBlocked, userController.LoginData);

// signup

router.get("/signup", userController.signup);

//OTP

router.post("/signupData", userController.signupData);

//otp
router.post("/otpData",userBlocked, userController.otpData);

// home

router.get("/home",userBlocked, homeController.homePage);

router.get("/gameDetails/:id",userBlocked, homeController.gameDetails);

router.get('/userProfile',userBlocked,homeController.userProfile)

router.get('/editUserProfile',userBlocked,homeController.editUserProfile)
router.post('/editProfileData',userBlocked,homeController.editProfileData)

router.get('/changePassword',userBlocked,homeController.changePassword)
router.post('/changePasswordData',userBlocked,homeController.changePasswordData)


//cart


router.get('/cart',isBlocked,homeController.cart)

router.post('/addToCart/:id',isBlocked,homeController.addToCart)
router.post('/removeCart/:id',isBlocked,homeController.removeCart)

router.get('/checkout',isBlocked,homeController.checkout)

//logout



router.get("/logout", homeController.userLogout);

//ADMIN

//adminlogin

router.get("/adminLogin", adminController.login);

router.post("/adminLoginData", adminController.loginData);

// admin dashboard

router.get("/adminDashboard", adminController.dashboard);

//USER

//user list

router.get("/userList", adminUser.userList);

//search User

router.get("/searchUser", adminUser.searchUser);

//  insert user

router.get("/insertUser", adminUser.insertUser);

router.post("/insertUserData", adminUser.insertUserData);

//edit user

// router.get("/editUser/:id", adminUser.editUser);

// router.post("/editUser/:id", adminUser.editUserData);

// Block a user
router.get("/block/:id", adminUser.blockUser);

// Unblock a user
router.get("/unblock/:id", adminUser.unblockUser);

//GAME

//game list

router.get("/gameList", adminGame.gameList);

//search game

router.get("/searchGame", adminGame.searchGame);

//  insert game
router.get("/insertGame", adminGame.insertGame);

router.post(
  "/insertGameData",
  adminController.upload,
  adminGame.insertGameData
);

// In your router.js file or wherever you define your routes

// Block a game
router.get("/unlist/:id", adminGame.unlistGame);

// Unblock a game
router.get("/list/:id", adminGame.listGame);

//edit games
router.get("/editGame/:id", adminGame.editGame);

router.post(
  "/editGame/:id",
  adminController.upload,
  adminGame.editGameData
);

//genre list
router.get("/genreList", adminGenre.genreList);

router.get("/unlistGenre/:id", adminGenre.unlistGenre);

// Unblock a game
router.get("/listGenre/:id", adminGenre.listGenre);

//search genre

router.get("/searchGenre", adminGenre.searchGenre);

//  insert genre
router.get("/insertGenre", adminGenre.insertGenre);

router.post("/insertGenreData", adminGenre.insertGenreData);

//edit genre

router.get("/editGenre/:id", adminGenre.editGenre);
router.post("/editGenre/:id", adminGenre.editGenreData);

//orders

router.get("/orders", adminOrder.orders);

//Admin Logout
router.get("/adminLogout", adminController.adminLogout);

module.exports = router;
