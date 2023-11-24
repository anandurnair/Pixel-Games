const Games = require("../Models/game");
const Genres = require("../Models/genre");
const Users = require("../Models/user");
const Cart = require("../Models/cart");
const Orders = require("../Models/order");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongoose").Types;
const installedGames=require('../Models/installedGames')

const homeController = {};

homeController.homePage = async (req, res) => {
  if (req.session.isLoggedIn) {
    const userId = req.session.userId;
    const user = await Users.findById(userId);
    const games = await Games.find();
    const genres = await Genres.find();

    res.render("home", { games, genres, user });
  } else {
    res.redirect("/");
  }
};

homeController.gameDetails = async (req, res) => {
  try {
    if (req.session.isLoggedIn) {
      const userId = req.session.userId;
      const gameId = new ObjectId(req.params.id);
      const user = await Users.findById(userId);
      const game = await Games.findById(gameId);

      // Check if the user has an installed game
      let installedGame = await installedGames.findOne({ userId });
      console.log("Installed game:", installedGame);

      const existingGameItem = installedGame
        ? installedGame.gameItems.find((item) => {
            console.log("Comparing:", String(item.gameId), String(gameId));
            return item.gameId.equals(gameId);
          })
        : null;

      console.log("Existing Game Item:", existingGameItem);
      if (existingGameItem) {
        req.session.gameExists = true;
      } else {
        req.session.gameExists = false;
      }
      released=game.released
      released=released.toLocaleDateString('en-IN');
      console.log("gameExists : ", req.session.gameExists);

      res.render("gameDetails", {
        game,
        user,
        released,
        gameExists: req.session.gameExists,
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

      res.redirect("/editUserProfile");
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
    // Find the cart document for the given userId
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      // Cart not found
      return "₹0.00";
    }

    // Sum up the prices of all items in the cart
    const totalSum = cart.items.reduce((sum, item) => {
      // Assuming price is a numeric field
      const itemPrice = parseFloat(item.price) || 0;
      return sum + itemPrice;
    }, 0);

    const formattedTotal = totalSum

    return formattedTotal;
  } catch (error) {
    console.error("Error calculating total sum:", error);
    throw error;
  }
};

homeController.cart = async (req, res) => {
  try {
    if (req.session.isLoggedIn) {
      let userId = req.session.userId;

      const user = await Users.findById(userId);

      const cart = await Cart.findOne({ userId }).populate("items.gameId");

      const totalSum = await calculateTotalSum(userId);
      console.log("Total Sum:", totalSum);

      let items = null;
      let cartNull = "";

      if (!cart) {
        // If cart is null or undefined
        cartNull = "No Games in cart";
        console.log("Cart not found for user:", userId);
        res.render("cart", { user,items, cart, totalSum, cartNull });
      } else {
        // If cart is found, check if it has items before accessing cart.items
        if (cart.items && cart.items.length > 0) {
          items = cart.items;
        } else {
          cartNull = "No Games in cart";
        }
        res.render("cart", { user, items, totalSum, cartNull });
      }
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//add to cart
homeController.addToCart = async (req, res) => {
  try {
    const userId = req.session.userId;
    const gameId = req.params.id;
    const game = await Games.findById(gameId);

    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    // Ensure userId is set before creating or updating the cart
    if (!userId) {
      return res.status(400).json({ error: "User ID is missing" });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
      await cart.save(); // Save the new cart document
    }

    if (!Array.isArray(cart.items)) {
      return res.status(500).json({ error: "Invalid cart structure" });
    }

    const existingItem = cart.items.find(
      (item) => String(item.gameId) === String(gameId)
    );

    if (existingItem) {
      return res.redirect(`/gameDetails/${game._id}`);
    } else {
      cart.items.push({
        gameId,
        gameName: game.gameName,
        price: game.price,
        released: game.released,
        gameSize: game.gameSize,
        gameImage: game.gameImage,
      });
      await Games.findByIdAndUpdate(gameId, { iscart: true });

      console.log("Game added to cart");
      await cart.save();
      return res.redirect(`/gameDetails/${game._id}`);
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

      console.log("userId:", userId);
      console.log("gameId:", gameId);

      const oneGame = await Cart.findOne(
        { userId, "items._id": gameId },
        { "items.$": 1 }
      );
      console.log(oneGame);
      const orginalgameId = oneGame.items[0].gameId;

      const game = await Games.updateOne(
        { _id: orginalgameId },
        { $set: { iscart: false } }
      );
      // game.iscart=false
      const result = await Cart.updateOne(
        { userId },
        { $pull: { items: { _id: gameId } } }
      );
      console.log("hi");
      console.log("result :", result);
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
      const userId = req.session.userId;
      const user = await Users.findById(userId);
      const cart = await Cart.findOne({ userId });
      const items = cart.items;
      const totalSum = await calculateTotalSum(userId);

      if (!cart) {
        console.log("Cart not found for user:", userId);
        res.render("cart", { user, cart });
      } else {
        res.render("cartCheckout", { user, items, totalSum });
      }
    } else {
      res.redirect("/");
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

//place order

homeController.placeOrder = async (req, res) => {
  try {
    if (req.session.isLoggedIn) {
      const userId = req.session.userId;
      const gameId = req.params.id;
      const user = await Users.findById(userId);
      const game = await Games.findById(gameId);
      let downloadGames=[]
      downloadGames.push(game.gameName)
      if (!game) {
        return res.status(404).json({ error: "Game not found" });
      }

      if (!userId) {
        return res.status(400).json({ error: "User ID is missing" });
      }

      let order = await Orders.findOne({ userId });
      let installedGame = await installedGames.findOne({ userId });

      if (!order) {
        order = new Orders({
          userId,
          gameItems: [],
          totalAmount: game.price,
        });
        await order.save();
      }
      if (!installedGame) {
        installedGame = new installedGames({
          userId,
          gameItems: [],
        });
        await installedGame.save();
      }

      // Check if the game is already in the order
      const existingGameItem = installedGame.gameItems.find(
        (item) => item.gameId.toString() === gameId
      );

      order.gameItems.push({
        gameId: gameId,
        gameTitle: game.gameName,
        gameImage: game.gameImage,
        price: game.price,
        orderDate:new Date(),
        orderStatus:"Downloaded"
      });

      if (existingGameItem) {
        console.log("Game already in the order");
        // Handle the case when the game is already in the order (optional)
      } else {
        installedGame.gameItems.push({
          gameId: gameId,
          gameTitle: game.gameName,
          gameImage: game.gameImage,
          price: game.price,
        });
        console.log("Game added to order");
      }

      await order.save();
      await installedGame.save();
      res.render("orderSuccessful", { user, game,downloadGames });
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

homeController.cartPlaceOrder = async (req, res) => {
  try {
    if (req.session.isLoggedIn) {
      const userId = req.session.userId;

      const user = await Users.findById(userId);
      const cart = await Cart.findOne({ userId });
      const items = cart.items;
      const totalSum = await calculateTotalSum(userId);

      if (!cart) {
        res.render("cartCheckout", { user, cart });
      } else {
        let order = await Orders.findOne({ userId });
        let installedGame = await installedGames.findOne({userId})
        if (!order) {
          order = new Orders({
            userId,
            gameItems: [],
            totalAmount: totalSum, // Use the calculated total sum from the cart
          });
          await order.save();
        }
        if (!installedGame) {
          installedGame = new installedGames({
            userId,
            gameItems: [] // Use the calculated total sum from the cart
          });
          await installedGame.save();
        }
        let downloadGames=[]
        items.forEach(async (game) => {
          const existingGameItem = installedGame.gameItems.find(
            (item) => item.gameId.toString() === game.gameId.toString()
          );
          order.gameItems.push({
            gameId: game.gameId,
            gameTitle: game.gameName,
            gameImage: game.gameImage,
            price: game.price,
          });
          await Games.updateOne(
            { _id: game.gameId },
            { $set: { iscart: false } }
          );
         downloadGames.push(game.gameName)

          if (existingGameItem) {
            console.log(`Game ${game._id} already in the order`);
          } else {
            installedGame.gameItems.push({
              gameId: game.gameId,
              gameTitle: game.gameName,
              gameImage: game.gameImage,
              price: game.price,
              orderDate:new Date(),
              orderStatus:"Downloaded"
            });
          }

        });

        await Cart.updateOne({ userId }, { $set: { items: [] } });
        console.log("dowload Games :",downloadGames)
        
        await order.save();
        await installedGame.save()
        console.log("Orders Placed");
        res.render("orderSuccessful", { user,downloadGames });
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
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
    } else {
      res.redirect("/");
    }
  });
};

homeController.installedGames=async(req,res)=>{
  try{
  if (req.session.isLoggedIn) {
    let userId = req.session.userId;

    const user = await Users.findById(userId);

    const games = await installedGames.findOne({ userId }).populate("gameItems.gameId");

    // const games = await installedGames.findOne({ userId })

    let items = null;
    let gameNull = "";

    if (!games) {
      // If cart is null or undefined
      gameNull = "No Games installed";
   
      res.render("installedGames", { user,items, games, gameNull });
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
}


homeController.uninstalledGame=async(req,res)=>{
  try{
  if (req.session.isLoggedIn) {
    let userId = req.session.userId;

    const user = await Users.findById(userId);
    const {gameId} = req.body
    console.log(gameId)
    const installedGame = await installedGames.findOne({ userId })
    await installedGames.updateOne(
      { userId },
      { $pull: { gameItems: { _id: gameId } } }
    );

    
    res.redirect('/installedGames')

    
  } else {
    res.redirect("/");
  }
  
} catch (error) {
  console.log(error);
  res.status(500).json({ error: "Internal server error" });
}
}


homeController.orderHistory = async (req, res) => {
  try {
    if (req.session.isLoggedIn) {
      let userId = req.session.userId;
      const user = await Users.findById(userId)
      const orders = await Orders.findOne({userId})
      let items = null;
      let orderNull = "";
      
      if (!orders) {
        // If orders is null or undefined
        orderNull = "No orders";
        res.render("orderHistory", { user, items, orders, orderNull });
      } else {
        // If orders is found, check if it has gameItems before accessing orders.gameItems
        if (orders.gameItems && orders.gameItems.length > 0) {
          items = orders.gameItems;
        } else {
          orderNull = "No Games Installed";
        }
        res.render("orderHistory", { user, items, orderNull });
      }
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

homeController.downloading=async(req,res)=>{
  try {
    const userId=req.session.userId
    const {gameTitle}=req.body
    console.log("game title :",gameTitle)
    // const result = await Orders.updateOne(
    //   { userId, 'gameItems.gameTitle': gameTitle },
    //   { $set: { 'gameItems.$.orderStatus': 'Downloaded' } }
    // );
    console.log('Order status updated successfully:', result);
  } catch (err) {
    console.error('Error updating order status:', err);
  }
}




module.exports = homeController;
