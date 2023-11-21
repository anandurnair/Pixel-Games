const nodemailer = require("nodemailer");
const Users = require("../Models/user");
const bcrypt = require("bcrypt");

const userController = {};

var isLoggedIn;
var fullName;
var userError;
var blockMessage ;

userController.Login = (req, res) => {
  const blockMessage =req.session.blockMessage
  const userError = req.session.userError;
  if (req.session.isLoggedIn) {
    res.redirect("/home");
  } else {
    res.render("user-login", { userError, blockMessage });
  }
};

userController.LoginData = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Users.findOne({ email: email });
    const check = await bcrypt.compare(password, user.password);
   
    req.session.blockMessage = false;
    if (email === user.email && check) {
      req.session.userId = user._id;
      req.session.isLoggedIn = true;
     req.session.userError = false;
      return res.redirect("/home");
    } else {
      req.session.userError = true;
      res.redirect("/");
    }
  } catch {
    req.session.userError = true;
    // res.status(500).json({ error: "Internal server error" });
    return res.redirect("/");
  }
};

userController.signup = (req, res) => {
  if (req.session.isLoggedIn) {
    res.redirect("/home");
  } else {
    res.render("user-signup", { message1: "" });
  }
};

//OTP
let generatedOTP = "";

// Generate OTP function
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Create a Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "anandurpallam@gmail.com", // replace with your email
    pass: "gxej hquc oifu hzdo", // replace with your password or an app-specific password
  },
});

userController.signupData = async (req, res) => {
  if (req.session.isLoggedIn) {
    res.redirect("/home");
  } else {
    try {
      const { fullName, email, password } = req.body;
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Generate OTP
      generatedOTP = generateOTP();

      // Compose email
      const mailOptions = {
        from: "anandurpallam@gmail.com", // replace with your email
        to: email,
        subject: "Your OTP Code",
        text: `Your OTP code is: ${generatedOTP}`,
      };
      const user = await Users.findOne({ email });
      console.log(user);

      if (!user) {
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error("Error sending OTP email:", error);
            return res.status(500).json({ error: "Error sending OTP email" });
          }

          // Render the OTP page or do whatever you want after sending the OTP
          res.render("otp", {
            fullName,
            email,
            password: hashedPassword,
            error: "",
          });
        });
      } else {
        res.render("user-signup", { message1: "User already exists" });
      }
      // Send email
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

userController.otpData = async (req, res) => {
  const { fullName, email, password, otpCode } = req.body;
  try {
    // Perform OTP verification
    const isOtpValid = otpCode === generatedOTP;
    console.log(isOtpValid);
    if (isOtpValid) {
      // If OTP is valid, create a new user
      const user = new Users({ fullName, email, password });
      const savedUser = await user.save();
      req.session.isLoggedIn = true;
      req.session.userId = user._id;
      // Redirect to the next page or perform any other action
      res.redirect("/home");
    } else {
      // If OTP is invalid, render the OTP page again with an error message
      res.render("otp", {
        fullName,
        email,
        password,
        error: "Invalid OTP. Please try again.",
      });
    }
  } catch (error) {
    // Handle any errors that may occur during OTP verification or user creation
    console.error("Error in OTP verification or user creation:", error);

    // Provide a more user-friendly error message
    res.render("otp", {
      fullName,
      email,
      password,
      error: "Something went wrong. Please try again later.",
    });
  }
};


module.exports = userController;
