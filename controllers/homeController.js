const Games = require("../Models/game");
const Genres = require("../Models/genre");
const Users = require("../Models/user");
const Cart = require("../Models/cart");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongoose").Types;
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
      const user = await Users.findById(userId);
      const game = await Games.findById(req.params.id);

      res.render("gameDetails", { game, user });
    } else {
      res.redirect("/");
    }
  } catch (error) {
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

    const formattedTotal = totalSum.toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
    });

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
      const items = cart.items;

      const totalSum = await calculateTotalSum(userId);
      console.log("Total Sum:", totalSum);

      if (!cart) {
        console.log("Cart not found for user:", userId);
        res.render("cart", { user, cart });
      } else {
        res.render("cart", { user, items, totalSum });
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
      console.log(oneGame)
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
      console.log('result :',result);
      res.redirect("/cart");
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
      const user = await Users.findById(userId);
      res.render("checkout", { user });
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

module.exports = homeController;
