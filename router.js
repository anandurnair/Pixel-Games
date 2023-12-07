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
const couponController=require('./controllers/couponController')
const adminUser = require("./controllers/adminUser");
const adminGame = require("./controllers/adminGame");
const adminGenre = require("./controllers/adminGenre");
const adminOrder = require("./controllers/adminOrder");
const adminCoupon=require('./controllers/adminCoupon')

//middlewares

const userBlocked=require('./middlewares/userBlocked')
const isValidUser = require('./middlewares/isValidUser');
const { AddOnResultContext } = require("twilio/lib/rest/api/v2010/account/recording/addOnResult");


//login
router.get("/", userController.Login);
router.post("/loginData",isValidUser, userController.LoginData);

// signup

router.get("/signup", userController.signup);

//OTP

router.post("/signupData", userController.signupData);

//otp
router.post("/otpData", userController.otpData);
router.post("/resendotp", userController.resendOTP);
// home
router.get("/forgotPassword",userController.forgotPassword)
router.post("/forgotPasswordData",userController.forgotPasswordData)
router.post("/passwordOTPData",userController.passwordOTPData)
router.post("/newPasswordData",userController.newPasswordData)



router.get("/home",userBlocked, homeController.homePage);
router.get("/categories",userBlocked, homeController.categories);

router.get("/gameDetails/:id",userBlocked, homeController.gameDetails);

router.get('/userProfile',userBlocked,homeController.userProfile)

router.get('/editUserProfile',userBlocked,homeController.editUserProfile)
router.post('/editProfileData',userBlocked,homeController.editProfileData)

router.get('/changePassword',userBlocked,homeController.changePassword)
router.post('/changePasswordData',userBlocked,homeController.changePasswordData)


//cart


router.get('/cart',userBlocked,homeController.cart)

router.post('/addToCart/:id',userBlocked,homeController.addToCart)
router.post('/removeCart/:id',userBlocked,homeController.removeCart)

router.get('/cart/checkout/:value',userBlocked,homeController.cartCheckout)

router.get('/checkout/:id',userBlocked,homeController.checkout)


//PLACE ORDER

// router.post('/cart/placeOrder/:id',homeController)

router.post('/cart/placeOrder',userBlocked,homeController.cartPlaceOrder)
// router.post('/placeOrder/:id',userBlocked,homeController.placeOrder)
router.post('/createOrder',userBlocked,homeController.createOrder)

//  installed games

router.get('/installedGames',userBlocked,homeController.installedGames)

router.post('/uninstallGame',userBlocked,homeController.uninstalledGame)

router.get('/orderHistory',userBlocked,homeController.orderHistory)
//logout
router.post('/downloading',userBlocked,homeController.downloading)

router.get('/wishlist',userBlocked,homeController.wishlist)

router.post('/addToWishlist/:id',userBlocked,homeController.addToWishlist)

router.post('/removeWishlist/:id',userBlocked,homeController.removeWishlist)
router.post('/moveToCart/:id',userBlocked,homeController.moveToCart)
router.post('/moveToWishlist/:id',userBlocked,homeController.moveToWishlist)

router.get('/wallet',userBlocked,homeController.wallet)

router.get('/searchGames',userBlocked,homeController.searchGames)
router.post('/commentData',userBlocked,homeController.comment)
router.post('/deleteComment',userBlocked,homeController.deleteComment)

router.post('/couponCode',userBlocked,homeController.couponCode)


//Wallet

router.get('/addMoney',userBlocked,homeController.addMoney)
router.post('/addMoneyData',userBlocked,homeController.addMoneyData)


router.post('/walletPlaceOrderData',userBlocked,homeController.walletPlaceOrderData)
router.get('/walletPlaceOrder',homeController.walletPlaceOrder)
router.get("/logout",userBlocked, homeController.userLogout);
router.get('/orderSuccessfull',userBlocked,homeController.orderSuccessful)
router.post('/verifyPayment',userBlocked,homeController.verifyPayment)
router.post('/paymentFailed',userBlocked,homeController.paymentFailed)


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

router.get("/orderlist", adminOrder.orderList);


//coupon

router.get('/couponList',adminCoupon.couponList)
router.get('/insertCoupon',adminCoupon.insertCoupon)
router.post('/insertCouponData',adminCoupon.insertCouponData)
router.get('/deactiveCoupon/:id',adminCoupon.deactiveCoupon)
router.get('/activeCoupon/:id',adminCoupon.activeCoupon)
router.get('/editCoupon/:id',adminCoupon.editCoupon)
router.post('/editCouponData/:id',adminCoupon.editCouponData)
//Admin Logout
router.get("/adminLogout", adminController.adminLogout);

module.exports = router;
