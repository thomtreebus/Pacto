const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = mongoose.Schema({
  author: {
    type: String,
    required: true
  },

  text: {
    type: String,
    required: true
  },

  votes: {
    type: Number,
    required: true,
    default: 0
  },

  upvoters: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],

  downvoters: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],

  childcomments: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment',
    required: true
  }],

});

const Comment = mongoose.model('Comments', CommentSchema);

module.exports = Comment;