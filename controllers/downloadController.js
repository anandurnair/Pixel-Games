const Games = require("../Models/game");
const Genres = require("../Models/genre");
const Users = require("../Models/user");
const Cart = require("../Models/cart");
const Orders = require("../Models/order");
const Comment = require("../Models/gameComments");
const Coupons = require("../Models/coupon");
const Wallet = require("../Models/wallet");

const mongoose = require("../config/db");
const { v4: uuidv4 } = require('uuid');


const downloadController = {};

const uniqueToken = uuidv4();


module.exports= downloadController;
