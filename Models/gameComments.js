
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
 
  gameId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'games',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  text: {
    type: String,
    
  },
  createdAt: {
    type: String,
    
  },
  rating:{
    type:Number,
    default:0
  }
 
 
 
});

const Comment = mongoose.model('comments', commentSchema);

module.exports = Comment;
