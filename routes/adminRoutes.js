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
const adminGame = require("../controllers/adminGame");
const adminGenre = require("../controllers/adminGenre");
const adminOrder = require("../controllers/adminOrder");
const adminCoupon=require('../controllers/adminCoupon')

//middlewares

const userBlocked=require('../middlewares/userBlocked')
const isValidUser = require('../middlewares/isValidUser');
const { AddOnResultContext } = require("twilio/lib/rest/api/v2010/account/recording/addOnResult");
const adminComment = require("../controllers/adminComment");

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

adminRouter.get("/gameList", adminGame.gameList);

//search game

adminRouter.get("/searchGame", adminGame.searchGame);

//  insert game
adminRouter.get("/insertGame", adminGame.insertGame);

adminRouter.post(
  "/insertGameData",
  adminController.upload,
  adminGame.insertGameData
);

// In your adminRouter.js file or wherever you define your routes

// Block a game
adminRouter.get("/unlist/:id", adminGame.unlistGame);

// Unblock a game
adminRouter.get("/list/:id", adminGame.listGame);

//edit games
adminRouter.get("/editGame/:id", adminGame.editGame);

adminRouter.post(
  "/editGame/:id",
  adminController.upload3,
  adminGame.editGameData
);

//genre list
adminRouter.get("/genreList", adminGenre.genreList);

adminRouter.get("/unlistGenre/:id", adminGenre.unlistGenre);

// Unblock a game
adminRouter.get("/listGenre/:id", adminGenre.listGenre);

//search genre

adminRouter.get("/searchGenre", adminGenre.searchGenre);

//  insert genre
adminRouter.get("/insertGenre", adminGenre.insertGenre);

adminRouter.post("/insertGenreData", adminGenre.insertGenreData);

//edit genre

adminRouter.get("/editGenre/:id", adminGenre.editGenre);
adminRouter.post("/editGenre/:id", adminGenre.editGenreData);

//orders

adminRouter.get("/orderlist", adminOrder.orderList);
adminRouter.get('/salesReport',adminController.salesReport)
//comment

adminRouter.get('/commentList',adminComment.commentList)
adminRouter.post('/adminDeleteComment',adminComment.adminDeleteComment)
//coupon

adminRouter.get('/revenues',adminController.revenue)
adminRouter.get('/gamesOrderedPerYear',adminController.gamesOrderedPerYear)
adminRouter.get('/gamesDownloadedPerMonthInYear',adminController.gamesDownloadedPerMonthInYear)
adminRouter.get('/mostInstalledGames',adminController.mostInstalledGames)
adminRouter.get('/couponList',adminCoupon.couponList)
adminRouter.get('/insertCoupon',adminCoupon.insertCoupon)
adminRouter.post('/insertCouponData',adminCoupon.insertCouponData)
adminRouter.get('/deactiveCoupon/:id',adminCoupon.deactiveCoupon)
adminRouter.get('/activeCoupon/:id',adminCoupon.activeCoupon)
adminRouter.get('/editCoupon/:id',adminCoupon.editCoupon)
adminRouter.post('/editCouponData/:id',adminCoupon.editCouponData)
//Admin Logout
adminRouter.get("/adminLogout", adminController.adminLogout);

module.exports = adminRouter;