const mongoose = require('mongoose');
const {COMMENT_MESSAGES} = require('../helpers/messages');
const Schema = mongoose.Schema;

const CommentSchema = mongoose.Schema({
  author: {
    type: String,
    required: true
  },
  
  text: {
    type: String,
    required: [true, COMMENT_MESSAGES.BLANK],
    maxLength: [512, COMMENT_MESSAGES.MAX_LENGTH_EXCEEDED]
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

  childComments: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment',
    required: true
  }],

  parentComment: {
    type: Schema.Types.ObjectId,
    ref: 'Comment',
    required: false
  },

  deleted: {
    type: Boolean,
    required: true,
    default: false
  }

}, { timestamps: true });

const Comment = mongoose.model('Comments', CommentSchema);

module.exports = Comment;