const Games = require("../Models/game");
const Genres = require("../Models/genre");
const Users = require("../Models/user");
const homeController={}


homeController.homePage= async(req,res)=>{
    if (req.session.isLoggedIn) {
      const userId = req.query.userId;
      const user = await Users.findById(userId);
        const games = await Games.find();
        const genres = await Genres.find();
       
        res.render("home", { games, genres,user });
      } else {
        res.redirect("/");
      }
}

homeController.gameDetails= async(req,res)=>{
    try {
        if (req.session.isLoggedIn) {
          const userId = req.query.userId;
          const user = await Users.findById(userId);
          const game = await Games.findById(req.params.id);
          res.render("gameDetails", { game,user });
        } else {
          res.redirect("/");
        }
      } catch (error) {
        res.status(500).json({ error: "Internal server error" });
      }
}

homeController.userLogout=(req,res)=>{
    req.session.isLoggedIn = false;
    res.redirect("/");
}



module.exports=homeController









