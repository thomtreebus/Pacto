const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { POST_MESSAGES } = require('../helpers/messages')

// function returns true if the given string is a valid type name
const isValidType = (str) => {
  const regex = /^(link|image|text)$/;
  return regex.test(str);
};

const PostSchema = mongoose.Schema({
  pact: {
    type: Schema.Types.ObjectId,
    ref: 'Pact',
    required: [true, POST_MESSAGES.NO_PACT],
  },

  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, POST_MESSAGES.NO_AUTHOR],
  },

  title: {
    type: String,
    maxLength: [50, POST_MESSAGES.TITLE.MAX_LENGTH_EXCEEDED],
    required: [true, POST_MESSAGES.TITLE.BLANK],
  },

  image: {
    type: String
  },

  text: {
    type: String
  },

  link: {
    type: String
  },

  type: {
    type: String,
    enum: ["link", "image", "text"],
    validate: [isValidType, POST_MESSAGES.TYPE.INVALID],
    required: [true, POST_MESSAGES.TYPE.BLANK],
    default: "text"
  },

  votes: {
    type: Number,
    required: [true, POST_MESSAGES.NO_VOTES],
    default: 0
  },

  upvoters: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, POST_MESSAGES.NO_UPVOTERS],
  }],

  downvoters: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, POST_MESSAGES.NO_DOWNVOTERS],
  }],

  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment',
    required: false,
  }],

}, { timestamps: true });

const Post = mongoose.model('Posts', PostSchema);

module.exports = Post;