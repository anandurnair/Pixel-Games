
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
    required: true,
  },
  createdAt: {
    type: String,
    
  },
 
 
 
});

const Comment = mongoose.model('comments', commentSchema);

module.exports = Comment;
