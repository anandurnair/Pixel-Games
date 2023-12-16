const express = require("express");
const userRouter = express.Router();
const Users = require("../Models/user");
const Games = require("../Models/game");
const Genres = require("../Models/genre");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

const userController = require("../controllers/userController");
const homeController = require("../controllers/homeController");
const adminController = require("../controllers/adminController");

const adminUser = require("../controllers/adminUser");
const adminGame = require("../controllers/adminGame");
const adminGenre = require("../controllers/adminGenre");
const adminOrder = require("../controllers/adminOrder");
const adminCoupon=require('../controllers/adminCoupon')

//middlewares

const userBlocked=require('../middlewares/userBlocked')
const isValidUser = require('../middlewares/isValidUser');
const { AddOnResultContext } = require("twilio/lib/rest/api/v2010/account/recording/addOnResult");
const adminComment = require("../controllers/adminComment");


//login
userRouter.get("/", userController.Login);
userRouter.post("/loginData",isValidUser, userController.LoginData);

// signup

userRouter.get("/signup", userController.signup);

//OTP

userRouter.post("/signupData", userController.signupData);

//otp
userRouter.post("/otpData", userController.otpData);
userRouter.post("/resendotp", userController.resendOTP);
// home
userRouter.get("/forgotPassword",userController.forgotPassword)
userRouter.post("/forgotPasswordData",userController.forgotPasswordData)
userRouter.post("/passwordOTPData",userController.passwordOTPData)
userRouter.post("/newPasswordData",userController.newPasswordData)



userRouter.get("/home",userBlocked, homeController.homePage);
userRouter.get("/categories",userBlocked, homeController.categories);

userRouter.get("/gameDetails/:id",userBlocked, homeController.gameDetails);

userRouter.get('/userProfile',userBlocked,homeController.userProfile)

userRouter.get('/editUserProfile',userBlocked,homeController.editUserProfile)
userRouter.post('/editProfileData',userBlocked,homeController.editProfileData)

userRouter.get('/changePassword',userBlocked,homeController.changePassword)
userRouter.post('/changePasswordData',userBlocked,homeController.changePasswordData)


//cart


userRouter.get('/cart',userBlocked,homeController.cart)

userRouter.post('/addToCart',userBlocked,homeController.addToCart)
userRouter.post('/removeCart',userBlocked,homeController.removeCart)

userRouter.get('/cart/checkout/:value',userBlocked,homeController.cartCheckout)

userRouter.get('/checkout/:id',userBlocked,homeController.checkout)


//PLACE ORDER

// userRouter.post('/cart/placeOrder/:id',homeController)

userRouter.post('/cart/placeOrder',userBlocked,homeController.cartPlaceOrder)
// userRouter.post('/placeOrder/:id',userBlocked,homeController.placeOrder)
userRouter.post('/createOrder',userBlocked,homeController.createOrder)

//  installed games

userRouter.get('/installedGames',userBlocked,homeController.installedGames)

userRouter.post('/uninstallGame',userBlocked,homeController.uninstalledGame)

userRouter.get('/orderHistory',userBlocked,homeController.orderHistory)
//logout
userRouter.post('/downloading',userBlocked,homeController.downloading)

userRouter.get('/wishlist',userBlocked,homeController.wishlist)

userRouter.post('/addToWishlist',userBlocked,homeController.addToWishlist)

userRouter.post('/removeWishlist',userBlocked,homeController.removeWishlist)
userRouter.post('/moveToCart',userBlocked,homeController.moveToCart)
userRouter.post('/moveToWishlist',userBlocked,homeController.moveToWishlist)

userRouter.get('/wallet',userBlocked,homeController.wallet)

userRouter.get('/searchGames',userBlocked,homeController.searchGames)
userRouter.post('/commentData',userBlocked,homeController.comment)
userRouter.post('/deleteComment',userBlocked,homeController.deleteComment)

userRouter.post('/couponCode',userBlocked,homeController.couponCode)


//Wallet



userRouter.post('/walletPlaceOrderData',userBlocked,homeController.walletPlaceOrderData)
userRouter.get('/walletPlaceOrder',homeController.walletPlaceOrder)
userRouter.get("/logout",userBlocked, homeController.userLogout);
userRouter.get('/orderSuccessfull',userBlocked,homeController.orderSuccessful)
userRouter.post('/verifyPayment',userBlocked,homeController.verifyPayment)
userRouter.post('/paymentFailed',userBlocked,homeController.paymentFailed)

userRouter.post('/reportComment',userBlocked,homeController.reportComment)


userRouter.post('/rating',userBlocked,homeController.rating)
userRouter.post('/verifyPayment2',userBlocked,homeController.verifyPayment2)
userRouter.post('/paymentFailed2',userBlocked,homeController.paymentFailed2)
userRouter.post('/createOrder2',userBlocked,homeController.createOrder2)

userRouter.post('/gameFilter',userBlocked,homeController.gameFilter)


module.exports=userRouter