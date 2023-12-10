
const mongoose = require('mongoose');
const Games = require('./game')
const Comments =require('./gameComments')

const commentSchema = new mongoose.Schema({
 
  commentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'comments',
    required: true,
  },
  gameId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'games',
    required: true
  },
  reason:{
    type:String
  },
  date:{
    type:Date
  }
  
 
});

const reportedComments = mongoose.model('reportedComments', commentSchema);

module.exports = reportedComments;
