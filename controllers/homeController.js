const Games = require("../Models/game");
const Genres = require("../Models/genre");
const Users = require("../Models/user");
const Cart = require("../Models/cart");
const Orders = require("../Models/order");
const Comment = require("../Models/gameComments");
const Coupons = require("../Models/coupon");
const Wallet = require("../Models/wallet");
const ejs = require('ejs');

const mongoose = require("../config/db");
const moment = require("moment");
const Razorpay = require("razorpay");

// Import the mongoose connection from db.js

const Wishlist = require("../Models/wishlist");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongoose").Types;
const installedGames = require("../Models/installedGames");
const Coupon = require("../Models/coupon");
const reportedComments = require("../Models/reportedComments");

const razorpay = new Razorpay({
  key_id: "YOUR_TEST_KEY_ID",
  key_secret: "YOUR_TEST_KEY_SECRET",
});
let couponError = false;
const homeController = {};

homeController.homePage = async (req, res) => {
  try {
    if (req.session.isLoggedIn) {
      const userId = req.session.userId;
      const user = await Users.findById(userId);
      const games = await Games.find();
      const genres = await Genres.find();
      const wallet = await Wallet.findOne({ userId });
      if (!wallet) {
        const newWallet = new Wallet({ userId, balance: 0 });
        await newWallet.save();
      }
  
      res.render("home", { games, genres, user });
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Internal server error" });
  }
  
};
homeController.categories = async (req, res) => {
  try {
    if (req.session.isLoggedIn) {
      const userId = req.session.userId;
      const user = await Users.findById(userId);
     
      const genres = await Genres.find();
  
      let currentPage = parseInt(req.query.page) || 1;
      const perPage = 12;
      if (currentPage < 1) {
        currentPage = 1; // Reset to 1 if currentPage is less than 1
      }
  
      const skipValue = (currentPage - 1) * perPage;
  
      const totalGames = await Games.countDocuments();
      const totalPages = Math.ceil(totalGames / perPage);
      const games = await Games.find()
      .skip(skipValue)
      .limit(perPage);
  
      res.render("categories", { games, genres,currentPage, totalPages, message: "", user });
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Internal server error" });
  }
 
};

homeController.gameDetails = async (req, res) => {
  try {
    if (req.session.isLoggedIn) {
      const userId = req.session.userId;
      const gameId = new ObjectId(req.params.id);
      const user = await Users.findById(userId);
      const game = await Games.findById(gameId);
      const cart = await Cart.findOne({ userId }).populate("items.gameId");

      let userInstalled = false
      const order = await Orders.findOne({
        userId: userId, 
        'gameItems.gameId': gameId, 
      });

      if(order){
        userInstalled= true
      }

      const checkCart = await Cart.findOne({
        userId,
        "items.gameId": gameId,
      }).populate("items.gameId");
      const checkWishlist = await Wishlist.findOne({
        userId,
        "items.gameId": gameId,
      });
      let isWishlist = false;
      let isCart = false;
      if (checkCart) {
        isCart = true;
      }
      if (checkWishlist) {
        isWishlist = true;
      }
      // Check if the user has an installed game
      let installedGame = await installedGames.findOne({ userId });

      const existingGameItem = installedGame
        ? installedGame.gameItems.find((item) => {
            return item.gameId.equals(gameId);
          })
        : null;

      // Comments
      let comments = await Comment.find({ gameId }).populate(
        "userId"
      );
     console.log("Commet : ",comments.length)
      let isCommentNull = false;
      let commentsCount = 0;
       
      if (comments.length==0) {
       
        isCommentNull = true;

        
      } else {
        commentsCount = await Comment.countDocuments({ gameId });
      
      }

      if (existingGameItem) {
        req.session.gameExists = true;
      } else {
        req.session.gameExists = false;
      }
      console.log("CommentNull : ",isCommentNull)
      released = game.released;
      released = released.toLocaleDateString("en-IN");
      res.render("gameDetails", {
        game,
        userId,
        user,
        released,
        isCart,
        isWishlist,
        gameExists: req.session.gameExists,
       
        comments,
        isCommentNull,
        commentsCount,
        userInstalled
      });
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

var passwordError = false;
homeController.userProfile = async (req, res) => {
  try {
    if (req.session.isLoggedIn) {
      passwordError = false;
      const userId = req.session.userId;
      const user = await Users.findById(userId);
      // user.password= await bcrypt(user.password)
      res.render("userProfile", { user });
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

homeController.editUserProfile = async (req, res) => {
  try {
    if (req.session.isLoggedIn) {
      const userId = req.session.userId;
      const user = await Users.findById(userId);
      res.render("editUserProfile", { user });
    } else {
      res.redirect("/");
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

homeController.editProfileData = async (req, res) => {
  try {
    if (req.session.isLoggedIn) {
      let { fullName, email, phone, country } = req.body;
      const updateUser = { fullName, email, phone, country };
      const userId = req.session.userId;
      const user = await Users.findById(userId);

      await Users.findByIdAndUpdate(userId, updateUser);

      res.redirect("/userProfile");
    } else {
      res.redirect("/");
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

homeController.changePassword = async (req, res) => {
  try {
    if (req.session.isLoggedIn) {
      const userId = req.session.userId;
      const user = await Users.findById(userId);
      res.render("changePassword", { user, passwordError });
    } else {
      res.redirect("/");
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

homeController.changePasswordData = async (req, res) => {
  try {
    let { currentPassword, newPassword } = req.body;
    const password = newPassword;
    const userId = req.session.userId;
    const user = await Users.findById(userId);
    const check = await bcrypt.compare(currentPassword, user.password);
    if (check) {
      passwordError = false;
      await Users.findByIdAndUpdate(user._id, password);
      res.redirect("/userProfile");
    } else {
      passwordError = true;
      res.redirect("/changePassword");
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

//cart
const calculateTotalSum = async (userId) => {
  try {
    const cart = await Cart.findOne({ userId }).populate("items.gameId");

    if (!cart || !cart.items || !Array.isArray(cart.items)) {
      return "₹0.00";
    }

    const totalSum = cart.items.reduce((sum, item) => {
      const itemPrice = parseFloat(item.gameId.price) || 0;
      return sum + itemPrice;
    }, 0);

    return totalSum;
  } catch (error) {
    console.error("Error calculating total sum:", error);
    throw error;
  }
};

let isExistInWishlist = false;

//~ CART

homeController.cart = async (req, res) => {
  try {
    if (req.session.isLoggedIn) {
      let userId = req.session.userId;
      const user = await Users.findById(userId);

      const cart = await Cart.findOne({ userId }).populate("items.gameId");

      const totalSum = await calculateTotalSum(userId);

      const wishlistItems = await Wishlist.findOne({ userId }).populate(
        "items.gameId"
      );

      couponError = false;
      let items = null;
      let cartNull = "";

      if (!cart) {
        cartNull = "No Games in cart";
        res.render("cart", {
          user,
          items,
          totalSum,
          cartNull,
          isExistInWishlist,
        });
      } else {
        if (cart && cart.items.length > 0) {
          items = cart.items;
        } else {
          cartNull = "No Games in cart";
        }
        res.render("cart", {
          user,
          items,
          totalSum,
          cartNull,
          wishlistItems,
          isExistInWishlist,
          couponError,
        });
      }
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//coupon

//add to cart
homeController.addToCart = async (req, res) => {
  try {
    const userId = req.session.userId;
    const gameId = req.body.gameId
    gameId =new ObjectId(gameId)
    const game = await Games.findById(gameId);

    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    if (!userId) {
      return res.status(400).json({ error: "User ID is missing" });
    }

    let cart = await Cart.findOne({ userId }).populate("items.gameId");

    if (!cart) {
      cart = new Cart({ userId, items: [] });
      await cart.save();
    }

    if (!Array.isArray(cart.items)) {
      return res.status(500).json({ error: "Invalid cart structure" });
    }

    const existingItem = cart.items.find(
      (item) => String(item.gameId) == String(gameId)
    );
    console.log("Existing : ",existingItem)
    if (existingItem) {
      return res.json({ status: false})
    } else {
      cart.items.push({
        gameId,
      });

      await cart.save();
      return res.json({ status: true})
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

homeController.removeCart = async (req, res) => {
  try {
    if (req.session.isLoggedIn) {
      let userId = req.session.userId;
      userId = new ObjectId(userId);
      let gameId = req.params.id;

      gameId = new ObjectId(gameId);

      const oneGame = await Cart.findOne(
        { userId, "items._id": gameId },
        { "items.$": 1 }
      );
      const orginalgameId = oneGame.items[0].gameId;

      // game.iscart=false
      const result = await Cart.updateOne(
        { userId },
        { $pull: { items: { _id: gameId } } }
      );

      res.redirect("/cart");
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

homeController.cartCheckout = async (req, res) => {
  try {
    if (req.session.isLoggedIn) {
      let discountValue = 0;

      console.log("DISCOUNT : ", discountValue);

      const userId = req.session.userId;
      const user = await Users.findById(userId);
      const cart = await Cart.findOne({ userId }).populate("items.gameId");
      console.log("CART : ", cart.items);
      if (cart.items.length === 0) {
        return res.redirect("/cart");
      }
      const items = cart.items;
      let totalSum = await calculateTotalSum(userId);
      let totalAmount = parseInt(totalSum);
      const coupons = await Coupons.find();
      let subTotal = totalSum;
      let discount = 0;
      console.log("HIII", req.params.value);
      if (!isNaN(req.params.value)) {
        let discountPercent = parseFloat(req.params.value);

        discountValue = parseInt((discountPercent / 100) * totalAmount);

        totalAmount = totalAmount - discountValue;
      }

      const order = await Orders.findOne({ userId });

      let availableCoupons = [];
      let isCouponAvailable = false;
      const total = parseInt(subTotal);


      for (const coupon of coupons) {
       
        
     
        if (coupon.validUntil < new Date()) {
          
          await Coupon.updateOne({ code: coupon.code }, { $set: { isExpired: true ,status:'Expired'} });
         
        }
        
        if (coupon.discountType === "firstPurchase" && coupon.isActive== true && coupon.isExpired== false) {
          if (!order) {
            isCouponAvailable = true;
            availableCoupons.push(coupon);
          }
        } else if (coupon.minimumPurchaseAmount <= total && coupon.isActive ==true && coupon.isExpired== false) {
          isCouponAvailable = true;
          availableCoupons.push(coupon);
        }
      }
      
       console.log("AvilableCoupons : ",availableCoupons)
      if (!cart) {
        res.render("cart", {
          user,
          cart,
          isCouponAvailable,
          availableCoupons,
          couponError,
        });
      } else {
        console.log("Discount Value: ", discountValue);

        res.render("cartCheckout", {
          user,
          items,
          discountValue: parseInt(discountValue),
          subTotal: parseFloat(subTotal),
          totalAmount: parseFloat(totalAmount),
          isCouponAvailable,
          availableCoupons,
          couponError,
        });
      }
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

homeController.couponCode = async (req, res) => {
  try {
    const { couponCode } = req.body;
    console.log("couponCode", couponCode);

    const coupon = await Coupons.find({ code: couponCode });
    const oneCoupon = coupon[0];
    console.log(oneCoupon);
    if (coupon[0] == undefined || oneCoupon.isActive == false ) {
      couponError = true;

      return res.redirect("/cart/checkout/:value");
    } else {
      couponError = false;

      return res.redirect(`/cart/checkout/${oneCoupon.discountValue}`);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

homeController.checkout = async (req, res) => {
  try {
    if (req.session.isLoggedIn) {
      const userId = req.session.userId;
      const gameId = req.params.id;
      const user = await Users.findById(userId);
      const game = await Games.findById(gameId);
      res.render("checkout", { user, game });
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};



var instance = new Razorpay({
  key_id: 'rzp_test_rWizGdKAm2zOqw',
  key_secret: '1O3E3LvWjg5r5ad5TE79za9U',
});

homeController.createOrder = async (req, res) => {
  try {
    const userId = req.session.userId;
    let { paymentOption, totalAmount, currency } = req.body;
    console.log("BODY : ", totalAmount, paymentOption, currency);
    const user = await Users.findById(userId);
    const wallet = await Wallet.findOne({ userId });
  


    if (paymentOption === "walletPayment") {
     
      let balanceErr = false;
      if (totalAmount > wallet.balance) {
        balanceErr = true;
      }
      console.log("HOI : ", balanceErr);
      return res.json({method:'wallet',balanceErr,totalAmount})


    } else {
      const options = {
        amount: totalAmount * 100, // Amount in paise
        currency: currency || 'INR',
        receipt: 'receipt_order_1',
        notes: {},
      };
      const order = await instance.orders.create(options);
      console.log("ORDER : ", order);
      return res.json(order); // Return JSON response for other payment options
    }
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



let balanceErr = false;
homeController.cartPlaceOrder = async (req, res) => {
  try {
    if (req.session.isLoggedIn) {
      const userId = req.session.userId;
      let {  totalAmount } = req.body;
      console.log("TOTAL : ", totalAmount);
      const user = await Users.findById(userId);
      const wallet = await Wallet.findOne({ userId });

      const cart = await Cart.findOne({ userId }).populate("items.gameId");
      const items = cart.items;
      // const totalSum = await calculateTotalSum(userId);

      if (!cart) {
       return res.render("cartCheckout", { user, cart });
      } else {
        let order = await Orders.findOne({ userId }).populate(
          "gameItems.gameId"
        );
        let installedGame = await installedGames
          .findOne({ userId })
          .populate("gameItems.gameId");
       
        if (!installedGame) {
          installedGame = new installedGames({
            userId,
            gameItems: [], // Use the calculated total sum from the cart
          });
          await installedGame.save();
        }
        let downloadGames = [];
        items.forEach(async (game) => {
          const existingGameItem = installedGame.gameItems.find(
            (item) => item.gameId.toString() === game.gameId.toString()
          );
          order.gameItems.push({
            gameId: game.gameId,
            orderDate: new Date(),
            orderStatus: "Downloaded",
          });

          downloadGames.push(game.gameId.gameName);

          if (existingGameItem) {
            console.log(`Game ${game._id} already in the order`);
          } else {
            installedGame.gameItems.push({
              gameId: game.gameId,
              orderDate: new Date(),
              orderStatus: "Downloaded",
            });
          }
        });

        await Cart.updateOne({ userId }, { $set: { items: [] } });

        await order.save();
        await installedGame.save();
        console.log("Orders Placed");
        return res.json({ user, downloadGames})
       
      }
    } else {
     return res.redirect("/");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error1" });
  }
};


//verify ORDER

homeController.verifyPayment=async(req,res)=>{
  try {

    console.log("Verifying")
    const { payment, order ,paymentOption} = req.body;

    const crypto = require("crypto");
    const hmac = crypto
      .createHmac("sha256", "1O3E3LvWjg5r5ad5TE79za9U")
      .update(payment.razorpay_order_id + "|" + payment.razorpay_payment_id)
      .digest("hex");

    if (hmac === payment.razorpay_signature) {
        console.log("Verified ...!")
        const userId = req.session.userId;
       
        let totalAmount=order.amount
        console.log("TOTAL : ", totalAmount);
        const user = await Users.findById(userId);
        const wallet = await Wallet.findOne({ userId });
  
        const cart = await Cart.findOne({ userId }).populate("items.gameId");
        const items = cart.items;
        // const totalSum = await calculateTotalSum(userId);
  
        if (!cart) {
         return res.render("cartCheckout", { user, cart });
        } else {
          let order = await Orders.findOne({ userId }).populate(
            "gameItems.gameId"
          );
          let installedGame = await installedGames
            .findOne({ userId })
            .populate("gameItems.gameId");
          
          if (!installedGame) {
            installedGame = new installedGames({
              userId,
              gameItems: [], // Use the calculated total sum from the cart
            });
            await installedGame.save();
          }
          let gameItemsArray=[{}]
          let downloadGames = [];
          items.forEach(async (game) => {
            const existingGameItem = installedGame.gameItems.find(
              (item) => item.gameId.toString() === game.gameId.toString()
            );
           
            gameItemsArray.push(game.gameId)
            downloadGames.push(game.gameId.gameName);
  
            if (existingGameItem) {
              console.log(`Game ${game._id} already in the order`);
            } else {
              installedGame.gameItems.push({
                gameId: game.gameId,
                orderDate: new Date(),
                orderStatus: "Downloaded",
              });
            }
          });
          const newOrder=new Orders({
            userId:userId,
            gameItems:items.map(item=>({
              gameId:item.gameId
            })),
            orderDate:new Date(),
            orderStatus:'Downloaded',
            paymentMethod:'Online payment',
            totalAmount:(totalAmount*0.01)
          })
  
          await Cart.updateOne({ userId }, { $set: { items: [] } });
  
          await newOrder.save();
          await installedGame.save();
          console.log("Orders Placed");
          console.log("nooop : ",downloadGames)
          return res.json({ status: true,  downloadGames})
          
        }
     
      
    } else {
      console.log("Verification Failed")
      res.json({ status: false });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error1" });
  }
}


homeController.paymentFailed=async(req,res)=>{
  try {
    const order = req.body;
    console.log("Pay ment failed")
    res.json({ status: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error1" });
  }
}


homeController.orderSuccessful=async(req,res)=>{
  try {
    if(req.session.isLoggedIn){
    const userId = req.session.userId;
      let downloadGames  = req.query.downloadGames;
      downloadGames = downloadGames.split(',');
      console.log("Download Games : ",downloadGames)
      const user = await Users.findById(userId);
      console.log("Orders Placed");
      res.render("orderSuccessful", { user, downloadGames });

    }else{
      return res.redirect("/");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error1" });
  }
}


homeController.walletPlaceOrder=async(req,res)=>{
  try {
    if(req.session.isLoggedIn){
      const totalAmount=req.query.totalAmount
      const userId = req.session.userId;
      const user = await Users.findById(userId);
      const wallet = await Wallet.findOne({ userId });
      const balance = wallet.balance
      console.log("hel",typeof totalAmount,typeof balance )
     let balanceErr = false;
      if (totalAmount > wallet.balance) {
        balanceErr = true;
      }
      res.render('walletPlaceOrder',{user,balance,wallet,balanceErr,totalAmount})

    }else{
      res.redirect("/");

    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

homeController.walletPlaceOrderData = async (req, res) => {
  try {
    if (req.session.isLoggedIn) {
      const userId = req.session.userId;
      const user = await Users.findById(userId);
      const cart = await Cart.findOne({ userId }).populate("items.gameId");
      const wallet = await Wallet.findOne({ userId });
     let totalAmount = req.body.totalAmount;
      const items = cart.items;
      // const totalSum = await calculateTotalSum(userId);

      let balance = wallet.balance;

      if (!cart) {
        res.render("cartCheckout", { user, cart });
      } else {
        let order = await Orders.findOne({ userId }).populate(
          "gameItems.gameId"
        );
        let installedGame = await installedGames
          .findOne({ userId })
          .populate("gameItems.gameId");
       
        if (!installedGame) {
          installedGame = new installedGames({
            userId,
            gameItems: [], // Use the calculated total sum from the cart
          });
          await installedGame.save();
        }
        let downloadGames = [];
        items.forEach(async (game) => {
          const existingGameItem = installedGame.gameItems.find(
            (item) => item.gameId.toString() === game.gameId.toString()
          );
          const newOrder=new Orders({
            userId:userId,
            gameItems:items.map(item=>({
              gameId:item.gameId
            })),
            orderDate:new Date(),
            orderStatus:'Downloaded',
            paymentMethod:'Online payment',
            totalAmount:(totalAmount*0.01)
          })
  

          downloadGames.push(game.gameId.gameName);

          if (existingGameItem) {
            console.log(`Game ${game._id} already in the order`);
          } else {
            installedGame.gameItems.push({
              gameId: game.gameId,
              orderDate: new Date(),
              orderStatus: "Downloaded",
            });
          }
        });
        totalAmount = parseInt(totalAmount)

        let newBalance = wallet.balance - totalAmount;
        await Wallet.updateOne({ userId }, { $set: { balance: newBalance } });
        await Wallet.updateOne(
          { userId },
          {
            $push: {
              transactionHistory: {
                transaction: "Purchase",
                amount: totalAmount,
              },
            },
          }
        );
        const newOrder=new Orders({
          userId:userId,
          gameItems:items.map(item=>({
            gameId:item.gameId
          })),
          orderDate:new Date(),
          orderStatus:'Downloaded',
          paymentMethod:'Wallet',
          totalAmount:totalAmount
        })

        await Cart.updateOne({ userId }, { $set: { items: [] } });

        await newOrder.save();
        await installedGame.save();
        console.log("Orders Placed");
        res.render("orderSuccessful", { user, downloadGames });
      }
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

homeController.userLogout = (req, res) => {
try {
  req.session.isLoggedIn= false
  res.redirect("/");
} catch (error) {
  console.log(error);
    res.status(500).json({ error: "Internal server error" });
}
 
};

homeController.installedGames = async (req, res) => {
  try {
    if (req.session.isLoggedIn) {
      let userId = req.session.userId;

      const user = await Users.findById(userId);

      const games = await installedGames
        .findOne({ userId })
        .populate("gameItems.gameId");

      // const games = await installedGames.findOne({ userId })

      let items = null;
      let gameNull = "";

      if (!games) {
        // If cart is null or undefined
        gameNull = "No Games installed";

        res.render("installedGames", { user, items, games, gameNull });
      } else {
        // If cart is found, check if it has items before accessing cart.items
        if (games.gameItems && games.gameItems.length > 0) {
          items = games.gameItems;
        } else {
          gameNull = "No Games Installed";
        }
        res.render("installedGames", { user, items, gameNull });
      }
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

homeController.uninstalledGame = async (req, res) => {
  try {
    if (req.session.isLoggedIn) {
      let userId = req.session.userId;

      const user = await Users.findById(userId);
      const { gameId } = req.body;
      console.log(gameId);
      const installedGame = await installedGames.findOne({ userId });
      await installedGames.updateOne(
        { userId },
        { $pull: { gameItems: { _id: gameId } } }
      );

      res.redirect("/installedGames");
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

homeController.orderHistory = async (req, res) => {
  try {
    if (req.session.isLoggedIn) {
      let userId = req.session.userId;
      const user = await Users.findById(userId);
      const orders = await Orders.find({ userId }).populate(
        "gameItems.gameId"
      );
      let items = null;
      let orderNull = "";
        console.log("OR : ",orders.length)
      if (orders.length==0) {
        orderNull = "No orders";
      }
        res.render("orderHistory", { user, items, orders, orderNull });
      
     
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

homeController.downloading = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { gameTitle } = req.body;
    console.log("game title :", gameTitle);
    // const result = await Orders.updateOne(
    //   { userId, 'gameItems.gameTitle': gameTitle },
    //   { $set: { 'gameItems.$.orderStatus': 'Downloaded' } }
    // );
    console.log("Order status updated successfully:", result);
  } catch (err) {
    console.error("Error updating order status:", err);
  }
};

//~ ADD TO WISHLIST

homeController.addToWishlist = async (req, res) => {
  try {
    const userId = req.session.userId; // Assuming you store userId in the session
    let gameId = req.body.gameId
    gameId =new ObjectId(gameId)
    console.log("Gmae id : ",gameId)

    const game = await Games.findById(gameId);
    console.log(game)
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    if (!userId) {
      return res.status(400).json({ error: "User ID is missing" });
    }

    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      wishlist = new Wishlist({ userId, items: [] });
      await wishlist.save();
    }

    if (!Array.isArray(wishlist.items)) {
      return res.status(500).json({ error: "Invalid cart structure" });
    }

    const existingItem = wishlist.items.find(
      (item) => String(item.gameId) === String(gameId)
    );

    if (existingItem) {
      return res.json({ status: false})

    } else {
      wishlist.items.push({
        gameId,
      });

      await wishlist.save(); // Save the wishlist after pushing the new item
      return res.json({ status: true})
;
    }
  } catch (error) {
    console.error("Error in addToWishlist:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

//!   WISHLIST

let isExistInCart = false;
homeController.wishlist = async (req, res) => {
  try {
    if (req.session.isLoggedIn) {
      let userId = req.session.userId;

      const user = await Users.findById(userId);

      const wishlist = await Wishlist.findOne({ userId }).populate(
        "items.gameId"
      );

      let items = null;
      let wishlistNull = "";

      if (!wishlist) {
        cartNull = "No Games in wishlist";
        console.log("wishlist not found for user:", userId);
        res.render("wishlist", {
          user,
          items,
          wishlist,
          wishlistNull,
          isExistInCart,
        });
      } else {
        if (wishlist && wishlist.items.length > 0) {
          items = wishlist.items;
        } else {
          cartNull = "No Games in wishlist";
        }
        res.render("wishlist", { user, items, wishlistNull, isExistInCart });
      }
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//! REMOVE FROM WISHLIST

homeController.removeWishlist = async (req, res) => {
  try {
    if (req.session.isLoggedIn) {
      let userId = req.session.userId;
      userId = new ObjectId(userId);
      let gameId = req.params.id;

      gameId = new ObjectId(gameId);

      const oneGame = await Wishlist.findOne(
        { userId, "items._id": gameId },
        { "items.$": 1 }
      );
      const result = await Wishlist.updateOne(
        { userId },
        { $pull: { items: { _id: gameId } } }
      );

      res.redirect("/wishlist");
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//! MOVE TO CART

homeController.moveToCart = async (req, res) => {
  try {
    console.log("working");
    const userId = req.session.userId;
    const gameId1 = req.params.id;
    const wishlist = await Wishlist.findOne({ userId });
    const item = wishlist.items.id(gameId1);
    const gameId = item.gameId;

    const game = await Games.findById(gameId);

    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    if (!userId) {
      return res.status(400).json({ error: "User ID is missing" });
    }

    let cart = await Cart.findOne({ userId }).populate("items.gameId");

    if (!cart) {
      cart = new Cart({ userId, items: [] });
      await cart.save();
    }

    if (!Array.isArray(cart.items)) {
      return res.status(500).json({ error: "Invalid cart structure" });
    }

    const existingItem = cart.items.find(
      (item) => String(item.gameId) === String(gameId)
    );

    if (existingItem) {
      isExistInCart = true;

      return res.redirect(`/wishlist`);
    } else {
      cart.items.push({
        gameId,
      });

      await cart.save();

      const updateResult = await Wishlist.findOneAndUpdate(
        { userId, "items.gameId": gameId },
        { $pull: { items: { gameId: gameId } } }
      );

      if (!updateResult) {
        return res.status(500).json({ error: "Failed to update the wishlist" });
      }
      isExistInCart = false;

      return res.redirect(`/wishlist`);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

//!     MOVE TO WISHLIST

homeController.moveToWishlist = async (req, res) => {
  try {
    const userId = req.session.userId;
    const gameId1 = req.params.id;
    const cart = await Cart.findOne({ userId }).populate("items.gameId");
    const item = cart.items.id(gameId1);
    const gameId = item.gameId;

    const game = await Games.findById(gameId);

    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    if (!userId) {
      return res.status(400).json({ error: "User ID is missing" });
    }

    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      wishlist = new Wishlist({ userId, items: [] });
      await wishlist.save();
    }

    if (!Array.isArray(wishlist.items)) {
      return res.status(500).json({ error: "Invalid wishlist structure" });
    }

    const existingItem = wishlist.items.find(
      (item) => String(item.gameId) === String(gameId)
    );

    if (existingItem) {
      isExistInWishlist = true;
      return res.redirect(`/cart`);
    } else {
      wishlist.items.push({
        gameId,
      });

      console.log("Game added to wishlist");
      await wishlist.save();

      const updateResult = await Cart.findOneAndUpdate(
        { userId, "items.gameId": gameId },
        { $pull: { items: { gameId: gameId } } }
      );

      if (!updateResult) {
        return res.status(500).json({ error: "Failed to update the cart" });
      }
      isExistInWishlist = false;
      return res.redirect(`/cart`);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

//!   WALLET

homeController.wallet = async (req, res) => {
  try {
    if (req.session.isLoggedIn) {
      const userId = req.session.userId;
      const user = await Users.findById(userId);
      const wallet = await Wallet.findOne({ userId });
      const transactionHistory = wallet.transactionHistory;
      let noTransactions = "";
      if (transactionHistory.length == 0) {
        res.render("wallet", {
          user,
          wallet,
          transactionHistory: [],
          noTransactions: "No transactions",
        });
      } else {
        res.render("wallet", {
          user,
          wallet,
          transactionHistory,
          noTransactions,
        });
      }
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
 
};

homeController.addMoney = async (req, res) => {
  try {
    if (req.session.isLoggedIn) {
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.error("Error searching for games:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
homeController.addMoneyData = async (req, res) => {
  try {
    if (req.session.isLoggedIn) {
      const userId = req.session.userId;
      const user = await Users.findById(userId);
      const { addAmount } = req.body;

      const wallet = await Wallet.findOne({ userId });
      const newBalance = Number(addAmount) + wallet.balance;
      await Wallet.updateOne({ userId }, { $set: { balance: newBalance } });
      await Wallet.updateOne(
        { userId },
        {
          $push: {
            transactionHistory: { transaction: "Money Added", amount: addAmount },
          },
        }
      );

      res.redirect("/wallet");
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.error("Error searching for games:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//!   SEARCH Games

homeController.searchGames = async (req, res) => {
  const { gameName } = req.query;
  try {
    const userId = req.session.userId;
    const user = await Users.findById(userId);

    let currentPage = parseInt(req.query.page) || 1;
    const perPage = 8;
    if (currentPage < 1) {
      currentPage = 1; // Reset to 1 if currentPage is less than 1
    }

    const skipValue = (currentPage - 1) * perPage;

    const totalGames = await Games.countDocuments();
    const totalPages = Math.ceil(totalGames / perPage);

    const games = await Games.find({
      gameName: new RegExp("^" + gameName, "i"),
    }) .skip(skipValue)
    .limit(perPage);
    const genres = await Genres.find();

    if (req.session.isLoggedIn) {
      if (games.length > 0) {
        res.render("categories", { user, genres, games,currentPage, totalPages, message: "", err: "" });
      } else {
        res.render("categories", {
          genres,
          user,currentPage, totalPages,
          games,
          message: "No games found",
          err: "",
        });
      }
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.error("Error searching for games:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

homeController.comment = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { gameId, commentData } = req.body;
    if (commentData == "") {
      return res.redirect(`/gameDetails/${gameId}`);
    }
   

   
    const currentDate = new Date();

    const options = { day: "2-digit", month: "short", year: "numeric" };
    const formattedDate = currentDate.toLocaleDateString("en-GB", options);
    const newComment = new Comment({
      gameId:gameId,
      userId:userId,
      text:commentData,
      createdAt:formattedDate
    })

    await newComment.save();
    res.redirect(`/gameDetails/${gameId}`);
  } catch (error) {
    console.error( error);
    res.status(500).json({ error: "Internal server error" });
  }
};

homeController.reportComment=async(req,res)=>{
  try {
    const {reason,commentId,gameId}=req.body

    console.log("Cpmment id : ",commentId)
    const reportComment = await reportedComments.find({commentId})
    const newReport= new reportedComments({
      commentId:commentId,
      gameId:gameId,
      reason:reason,
      date:new Date()
    })
    await newReport.save()
    res.redirect(`/gameDetails/${gameId}`);
  } catch (error) {
    console.error( error);
    res.status(500).json({ error: "Internal server error" });
  }
}



homeController.deleteComment = async (req, res) => {
  try {
    const { commentId, gameId } = req.body;
   const deleteOne= await Comment.findByIdAndDelete(
      
     commentId
    );
    
    res.redirect(`/gameDetails/${gameId}`);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = homeController;
