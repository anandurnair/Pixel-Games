const Games = require("../Models/game");
const multer = require("multer");
const Comments = require('../Models/gameComments')
const reportedComments =require('../Models/reportedComments')

const adminComment = {};

adminComment.commentList = async (req, res) => {
  try {
    if (req.session.adminLogIn) {

      let currentPage = parseInt(req.query.page) || 1;
      const perPage = 8;
      if (currentPage < 1) {
        currentPage = 1; // Reset to 1 if currentPage is less than 1
      }
  
      const skipValue = (currentPage - 1) * perPage;
  
      const totalGames = await reportedComments.countDocuments();
      const totalPages = Math.ceil(totalGames / perPage);
  
      const reportComments = await reportedComments
      .find()
      .populate('gameId').populate('commentId')
       
      console.log("report : ",reportComments)
  
      res.render('admin/pages/commentList', { reportComments, currentPage, totalPages,message: "" });
    } else {
      res.redirect("/adminLogin");
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Internal server error" });
  }
}
// adminComment.searchComment = async (req, res) => {
//   const { gameName } = req.query;
//   try {
//     const games = await Games.find({
//       gameName: new RegExp("^" + gameName, "i"),
//     });

//     if (req.session.adminLogIn) {
//       if (games.length > 0) {
//         res.render("admin/pages/gameList", { games, message: "", err: "" });
//       } else {
//         res.render("admin/pages/gameList", {
//           games,
//           message: "No users found with that game name",
//           err: "",
//         });
//       }
//     } else {
//       res.redirect("/adminLogin");
//     }
//   } catch (error) {
//     console.error("Error searching for games:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// }




adminComment.adminDeleteComment = async (req, res) => {
  try {
    const commentId = req.body.commentId
   const deleteOne= await Comments.findByIdAndDelete(
      
     commentId
    );
    await reportedComments.deleteOne({commentId:commentId})
    
    res.redirect(`/commentList`);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};


module.exports= adminComment;
