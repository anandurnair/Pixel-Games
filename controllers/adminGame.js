const Games = require("../Models/game");
const multer = require("multer");
const Genres = require("../Models/genre");
const adminGame = {};
const path = require('path')
const fs = require('fs')
let gameInsert =false 
adminGame.gameList = async (req, res) => {
  try {
    if (req.session.adminLogIn) {

      let currentPage = parseInt(req.query.page) || 1;
      const perPage = 8;
      if (currentPage < 1) {
        currentPage = 1; 
      }
  
      const skipValue = (currentPage - 1) * perPage;
  
      const totalGames = await Games.countDocuments();
      const totalPages = Math.ceil(totalGames / perPage);
  
      const games = await Games.find().sort({_id:-1})
        .skip(skipValue)
        .limit(perPage);
  
      res.render('admin/pages/gameList', { games, currentPage, totalPages,message: "" ,gameInsert:false});
    } else {
      res.redirect("/adminLogin");
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Internal server error" });
  }
};

adminGame.searchGame = async (req, res) => { 
  try {
    const { gameName } = req.query;
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
    }).skip(skipValue)
    .limit(perPage);

    if (req.session.adminLogIn) {
      if (games.length > 0) {
        res.render("admin/pages/gameList", { games, message: "", err: "" , currentPage, totalPages,gameInsert:false});
      } else {
        res.render("admin/pages/gameList", {
          games,
          message: "No users found with that game name",
          err: "",
          currentPage, totalPages,gameInsert:false
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

adminGame.insertGame = async(req, res) => {
  try {
    if (req.session.adminLogIn) {
      const genres = await Genres.find()
      console.log('Directory : ',__dirname)
  
      res.render("admin/pages/insertGame", { message1: "" ,genres});
    } else {
      res.redirect("/adminLogin");
    }
  } catch (error) {
    console.error("Error searching for games:", error);
    res.status(500).json({ error: "Internal server error" });
  }
  
};

adminGame.insertGameData = async (req, res) => {

  try {
    const genres = await Genres.find()
    const {
      gameName,
      description,
      genre,
      price,
      released,
      publisher,
      gameSize,
    } = req.body;


    // if (measure == "mb") {
    //   gameSize = parseFloat(gameSize / 1024);
    //   gameSize = gameSize.toFixed(2);
    // }


    const games = await Games.findOne({ gameName });
    console.log("GAMES N : ",games)
    if (!games) {
      const croppedImageData = JSON.parse(req.body.croppedImageData);
      console.log("Cropped image data : ",croppedImageData)
      
      const gameImages = req.files.map(file => `/views/gameImages/${file.filename}`);


      // Create a new game instance
      const newGame = new Games({
        gameName,
        description,
        genre,
        price,
        released,
        publisher,
        gameSize,
        gameImages,
        // croppedImageData,
      });
      // Save the game to the database
      await newGame.save();

      let currentPage = parseInt(req.query.page) || 1;
      const perPage = 8;
      if (currentPage < 1) {
        currentPage = 1; 
      }
  
      const skipValue = (currentPage - 1) * perPage;
  
      const totalGames = await Games.countDocuments();
      const totalPages = Math.ceil(totalGames / perPage);
  
      const games = await Games.find().sort({_id:-1})
        .skip(skipValue)
        .limit(perPage);
  
      res.render('admin/pages/gameList', { games, currentPage, totalPages,message: "",gameInsert:true });
    } else {
      res.render("admin/pages/insertGame", {
        message1: "Game is already exists",genres
      });
    }
  } catch (error) {
    console.error(error);

   
    res.status(500).json({ error: "Internal server error" });
}
}

adminGame.unlistGame = async (req, res) => {
  try {
    const game = await Games.findById(req.params.id);
    game.unlist = true; 
    await game.save();
    res.redirect("/gameList"); 
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

adminGame.listGame = async (req, res) => {
  try {
    const game = await Games.findById(req.params.id);

    game.unlist = false; 
    await game.save();
    res.redirect("/gameList"); 
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

    const gameImages = game.gameImages.slice(); 

    if (measure == "mb") {
      gameSize = parseFloat(gameSize / 1024);
      gameSize = gameSize.toFixed(2);
    }

    const games = await Games.findOne({ gameName });
    if (games) {
      for (let i = 1; i <= 3; i++) {
        const fileKey = `gameImage${i}`;
        if (req.files[fileKey] && req.files[fileKey].length > 0) {
          // If a new file is uploaded, update the image path
          gameImages[i - 1] = `/views/gameImages/${req.files[fileKey][0].filename}`;
        }
      }


      const updateObject = {
        gameName,
        description,
        genre,
        price,
        released,
        publisher,
        gameSize,
        gameImages
      };

      // If a new image is provided, add it to the update object
      // if (gameImage !== undefined) {
      //   updateObject.gameImage = gameImage;
      // }

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
