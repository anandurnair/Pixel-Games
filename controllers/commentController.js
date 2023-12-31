const Games = require("../Models/game");
const multer = require("multer");
const Comments = require('../Models/gameComments')
const reportedComments =require('../Models/reportedComments')

const commentController = {};

commentController.commentList = async (req, res) => {
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
       
      
      res.render('admin/pages/commentList', { reportComments, currentPage, totalPages,message: "" });
    } else {
      res.redirect("/adminLogin");
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Internal server error" });
  }
}




commentController.adminDeleteComment = async (req, res) => {
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


module.exports= commentController;
