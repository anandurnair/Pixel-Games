const nodemailer = require("nodemailer");
const Users = require("../Models/user");
const bcrypt = require("bcrypt");
const { render } = require("ejs");
const Wallet = require("../Models/wallet");

const userController = {};

var isLoggedIn;
var fullName;
var userError;
var blockMessage;

userController.Login = (req, res) => {
  try {
    const blockMessage = req.session.blockMessage;
    const userError = req.session.userError;
    if (req.session.isLoggedIn) {
      res.redirect("/home");
    } else {
      res.render("user-login", { userError, blockMessage });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
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
  try {
    if (req.session.isLoggedIn) {
      res.redirect("/home");
    } else {
      res.render("user-signup", { message1: "" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//OTP
let generatedOTP = "";
let otpResendAttempts = 0;

// Generate OTP function
const generateOTP = () => {
  otpGeneratedTime = Date.now(); 
  return Math.floor(100000 + Math.random() * 900000).toString();
};

userController.resendOTP = async (req, res) => {
  try {
    const { fullName, email, phone, password, otpCode } = req.body;
    const resendCooldown = 20 * 1000;
    let timeStamp = req.session.timeStamp;
    if (Date.now() - timeStamp < resendCooldown) {
      return res.json({ success: false, message: "Resend cooldown not met" });
    }
    const newOTP = () => {
      otpGeneratedTime = Date.now(); // Store the OTP generation time
      return Math.floor(100000 + Math.random() * 900000).toString();
    };
    otp = newOTP();
    req.session.timeStamp = Date.now();
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending OTP email:", error);
        res.json({ success: false, message: "Error during resend" });
      } else {
        res.json({ success: true, message: "OTP resend successfull" });
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create a Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "anandurpallam@gmail.com",
    pass: "gxej hquc oifu hzdo", 
  },
}); 

userController.signupData = async (req, res) => {
  if (req.session.isLoggedIn) {
    res.redirect("/home");
  } else {
    try {
      const { fullName, email, phone, password } = req.body;
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

      if (!user) {
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error("Error sending OTP email:", error);
            return res.status(500).json({ error: "Error sending OTP email" });
          }
          req.session.timeStamp = Date.now();
          res.render("otp", {
            fullName,
            email,
            phone,
            password: hashedPassword,
            time: new Date().getTime(),
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
  const { fullName, email, phone, time, password, otpCode } = req.body;

  try {
    let oldTime = time;
    let newTime = new Date().getTime();
    let timeDifference = (newTime - oldTime) / 1000;

    let isExpired = timeDifference > 60;
    const isOtpValid = otpCode === generatedOTP;

    if (isExpired) {
      res.render("otp", {
        fullName,
        email,
        phone,
        time: new Date().getTime(),
        password,
        error: "OTP Expired",
      });
    } else if (isOtpValid) {
      // If OTP is valid, create a new user
      const user = new Users({ fullName, email, phone, password });

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
        phone,
        time: new Date().getTime(),
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
      phone,
      time: new Date().getTime(),
      password,
      error: "Something went wrong. Please try again later.",
    });
  }
};

userController.forgotPassword = async (req, res) => {
  try {
    res.render("forgotPassword");
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

userController.forgotPasswordData = async (req, res) => {
  if (req.session.isLoggedIn) {
    res.redirect("/home");
  } else {
    try {
      const { email } = req.body;

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

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending OTP email:", error);
          return res.status(500).json({ error: "Error sending OTP email" });
        }
        req.session.timeStamp = Date.now();
        // Render the OTP page or do whatever you want after sending the OTP
        res.render("passwordOTP", {
          email,
          time: new Date().getTime(),
          error: "",
        });
      });

      // Send email
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

userController.passwordOTPData = async (req, res) => {
  const { email, time, otpCode } = req.body;
  try {
    let oldTime = time;
    let newTime = new Date().getTime();
    let timeDifference = (newTime - oldTime) / 1000;
    let isExpired = timeDifference > 60;

    const isOtpValid = otpCode === generatedOTP;

    if (isExpired) {
      res.render("passwordOTP", {
        email,
        time: new Date().getTime(),
        error: "OTP Expired",
      });
    }
    if (isOtpValid) {
      res.render("newPassword", { email });
    } else {
      res.render("passwordOTP", {
        email,
        time: new Date().getTime(),
        error: "Invalid OTP. Please try again.",
      });
    }
  } catch (error) {
    console.error("Error in OTP verification or user creation:", error);

    res.render("passwordOTP", {
      email,
      time: new Date().getTime(),
      error: "Something went wrong. Please try again later.",
    });
  }
};

userController.newPasswordData = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    await Users.updateOne(
      { email: email },
      { $set: { password: hashedPassword } }
    );
    res.redirect("/");
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

userController.forgotPassword = async (req, res) => {
  try {
    res.render("forgotPassword");
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = userController;
