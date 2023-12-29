const express = require("express");
const adminRouter = express.Router();
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
const gameController = require("../controllers/gameController");
const genreController = require("../controllers/genreController");
const orderController = require("../controllers/orderController");
const couponController=require('../controllers/couponController')
const bannerController = require('../controllers/bannerController')
//middlewares

const userBlocked=require('../middlewares/userBlocked')
const isValidUser = require('../middlewares/isValidUser');
const { AddOnResultContext } = require("twilio/lib/rest/api/v2010/account/recording/addOnResult");
const commentController = require("../controllers/commentController");

adminRouter.get("/adminLogin", adminController.login);

adminRouter.post("/adminLoginData", adminController.loginData);

// admin dashboard

adminRouter.get("/adminDashboard", adminController.dashboard);

//USER

//user list

adminRouter.get("/userList", adminUser.userList);

//search User

adminRouter.get("/searchUser", adminUser.searchUser);

//  insert user

adminRouter.get("/insertUser", adminUser.insertUser);

adminRouter.post("/insertUserData", adminUser.insertUserData);

//edit user

// adminRouter.get("/editUser/:id", adminUser.editUser);

// adminRouter.post("/editUser/:id", adminUser.editUserData);

// Block a user
adminRouter.get("/block/:id", adminUser.blockUser);

// Unblock a user
adminRouter.get("/unblock/:id", adminUser.unblockUser);

//GAME

//game list

adminRouter.get("/gameList", gameController.gameList);

//search game

adminRouter.get("/searchGame", gameController.searchGame);

//  insert game
adminRouter.get("/insertGame", gameController.insertGame);

adminRouter.post(
  "/insertGameData",
  adminController.upload,
  gameController.insertGameData
);

// In your adminRouter.js file or wherever you define your routes

// Block a game
adminRouter.get("/unlist/:id", gameController.unlistGame);

// Unblock a game
adminRouter.get("/list/:id", gameController.listGame);

//edit games
adminRouter.get("/editGame/:id", gameController.editGame);

adminRouter.post(
  "/editGame/:id",
  adminController.upload3,
  gameController.editGameData
);

//genre list
adminRouter.get("/genreList", genreController.genreList);

adminRouter.get("/unlistGenre/:id", genreController.unlistGenre);

// Unblock a game
adminRouter.get("/listGenre/:id", genreController.listGenre);

//search genre

adminRouter.get("/searchGenre", genreController.searchGenre);

//  insert genre
adminRouter.get("/insertGenre", genreController.insertGenre);

adminRouter.post("/insertGenreData", genreController.insertGenreData);

//edit genre

adminRouter.get("/editGenre/:id", genreController.editGenre);
adminRouter.post("/editGenre/:id", genreController.editGenreData);

//orders

adminRouter.get("/orderlist", orderController.orderList);
adminRouter.get('/PDFReport',adminController.PDFReport)
adminRouter.get('/PDFReportByMonth',adminController.PDFReportByMonth)
adminRouter.get('/PDFReportByDay',adminController.PDFReportByDay)

adminRouter.get('/excelReportByMonth',adminController.excelReportByMonth)
adminRouter.get('/excelReportByDay',adminController.excelReportByDay)


adminRouter.get('/excelReport',adminController.ExcelReport)
adminRouter.get('/gamesDownloadedPerDay',adminController.gamesDownloadedPerDay)
//comment
adminRouter.get('/deactiveBanner/:id',bannerController.deactiveBanner)
adminRouter.get('/activeBanner/:id',bannerController.activeBanner)

adminRouter.get('/insertBanner',bannerController.insertBanner)
adminRouter.get('/editBanner',bannerController.editBanner)


  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join( 'views', 'uploads'));
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
  });

const upload = multer({ storage: storage });  
adminRouter.post('/insertBannerData', upload.single('bannerImage'),bannerController.insertBannerData)
adminRouter.post('/editBannerData', upload.single('bannerImage'),bannerController.editBannerData)


adminRouter.get('/commentList',commentController.commentList)
adminRouter.post('/adminDeleteComment',commentController.adminDeleteComment)
//coupon
adminRouter.get('/bannerList',bannerController.bannerList)
adminRouter.get('/revenues',adminController.revenue)
adminRouter.get('/gamesOrderedPerYear',adminController.gamesOrderedPerYear)
adminRouter.get('/gamesDownloadedPerMonthInYear',adminController.gamesDownloadedPerMonthInYear)
adminRouter.get('/mostInstalledGames',adminController.mostInstalledGames)
adminRouter.get('/couponList',couponController.couponList)
adminRouter.get('/insertCoupon',couponController.insertCoupon)
adminRouter.post('/insertCouponData',couponController.insertCouponData)
adminRouter.get('/deactiveCoupon/:id',couponController.deactiveCoupon)
adminRouter.get('/activeCoupon/:id',couponController.activeCoupon)
adminRouter.get('/editCoupon/:id',couponController.editCoupon)
adminRouter.post('/editCouponData/:id',couponController.editCouponData)
//Admin Logout
adminRouter.get("/adminLogout", adminController.adminLogout);

module.exports = adminRouter;