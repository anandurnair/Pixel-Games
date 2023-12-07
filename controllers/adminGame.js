const Games = require("../Models/game");
const multer = require("multer");
const Genres = require("../Models/genre");
const adminGame = {};

adminGame.gameList = async (req, res) => {
  try {
    if (req.session.adminLogIn) {

      let currentPage = parseInt(req.query.page) || 1;
      const perPage = 8;
      if (currentPage < 1) {
        currentPage = 1; // Reset to 1 if currentPage is less than 1
      }
  
      const skipValue = (currentPage - 1) * perPage;
  
      const totalGames = await Games.countDocuments();
      const totalPages = Math.ceil(totalGames / perPage);
  
      const games = await Games.find()
        .skip(skipValue)
        .limit(perPage);
  
      res.render('admin/pages/gameList', { games, currentPage, totalPages,message: "" });
    } else {
      res.redirect("/adminLogin");
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Internal server error" });
  }
};

adminGame.searchGame = async (req, res) => {
  const { gameName } = req.query;
  try {
    const games = await Games.find({
      gameName: new RegExp("^" + gameName, "i"),
    });

    if (req.session.adminLogIn) {
      if (games.length > 0) {
        res.render("admin/pages/gameList", { games, message: "", err: "" });
      } else {
        res.render("admin/pages/gameList", {
          games,
          message: "No users found with that game name",
          err: "",
        });
      }
    } else {
      res.redirect("/adminLogin");
    }
  } catch (error) {
    console.error("Error searching for games:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

adminGame.insertGame = (req, res) => {
  if (req.session.adminLogIn) {
    res.render("admin/pages/insertGame", { message1: "" });
  } else {
    res.redirect("/adminLogin");
  }
};

adminGame.insertGameData = async (req, res) => {
  try {
    const {
      gameName,
      description,
      genre,
      price,
      released,
      publisher,
      gameSize,
    } = req.body;
    const games = await Games.findOne({ gameName });
    if (!games) {
      const croppedImageData = JSON.parse(req.body.croppedImageData);

      // Construct the image URL based on the destination folder and filename
      const gameImage = req.file
        ? `/views/gameImages/${req.file.filename}`
        : "";

      // Create a new game instance
      const newGame = new Games({
        gameName,
        description,
        genre,
        price,
        released,
        publisher,
        gameSize,
        gameImage,
        croppedImageData,
      });

      // Save the game to the database
      await newGame.save();

      if (req.file) {
        const imagePath = path.join(
          __dirname,
          "views",
          "gameImages",
          req.file.filename
        );
        fs.unlinkSync(imagePath);
      }

      // Render the insertGame page
      res.render("admin/pages/insertGame", { message1: "" });
    } else {
      res.render("admin/pages/insertGame", {
        message1: "Game is already exists",
      });
    }
  } catch (error) {
    console.error(error);

    // Handle the error and render an error page
    res.status(500).render("error", { error: "Internal Server Error" });
  }
};

adminGame.unlistGame = async (req, res) => {
  try {
    const game = await Games.findById(req.params.id);
    game.unlist = true; // Assuming you have a 'unlist' property in your Games model
    await game.save();
    res.redirect("/gameList"); // Redirect back to the game list page or another suitable page
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

adminGame.listGame = async (req, res) => {
  try {
    const game = await Games.findById(req.params.id);
    game.unlist = false; // Assuming you have a 'unlist' property in your Games model
    await game.save();
    res.redirect("/gameList"); // Redirect back to the game list page or another suitable page
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

adminGame.editGame = async (req, res) => {
  if (req.session.adminLogIn) {
    try {
      const genres = await Genres.find();
      const game = await Games.findById(req.params.id);
      res.render("admin/pages/editGame", { game, genres, message1: "" });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.redirect("/adminLogin");
  }
};
adminGame.editGameData = async (req, res) => {
  try {
    const genres = await Genres.find();
    const game = await Games.findById(req.params.id);
    const gameId = req.params.id;

    // Get other details from the request body
    let {
      gameName,
      description,
      genre,
      price,
      measure,
      released,
      publisher,
      gameSize,
    } = req.body;

    if (measure == "mb") {
      gameSize = parseFloat(gameSize / 1024);
      gameSize = gameSize.toFixed(2);
    }

    const games = await Games.findOne({ gameName });
    if (games) {
      const gameImage = req.file
        ? `/views/gameImages/${req.file.filename}`
        : undefined;

      const updateObject = {
        gameName,
        description,
        genre,
        price,
        released,
        publisher,
        gameSize,
      };

      // If a new image is provided, add it to the update object
      if (gameImage !== undefined) {
        updateObject.gameImage = gameImage;
      }

      // Update the game details in the database
      await Games.findByIdAndUpdate(gameId, updateObject);

      res.redirect("/gameList");
    } else {
      res.render("admin/pages/editGame", {
        game,
        genres,
        message1: "Game already exists",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = adminGame;
