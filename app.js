const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("./config/db");
const User = require("./Models/user");
const nocache = require("nocache");
const session = require("express-session");
const userRouter = require('./routes/userRoutes')
const adminRouter = require('./routes/adminRoutes')
const bodyParser = require("body-parser");
require('dotenv').config();

app.set("view engine", "ejs");

// Serve static files
// app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "views/admin")));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  next();
});
// app.use('/views/css', express.static(path.join(__dirname, 'views', 'css')));
app.use('/views/gameImages', express.static(path.join(__dirname, 'views', 'gameImages')));

app.set('views','./views')
// app.set('views','./views/admin')
app.use(express.static(path.join(__dirname, "views/user")));
app.use(express.static(path.join(__dirname, "views/user/css")));

// app.use(express.static(path.join(__dirname, "views/ad")));
app.use(express.static("views"));

app.use(nocache());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.Session_secret,
    resave: false,
    saveUninitialized: true,
  }))

  // app.set('views','./views/admin')
  // app.set('views','./views')
app.use(userRouter);
app.use(adminRouter)

app.listen(3000, () => console.log("Server is running"));

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});
