const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { POST_MESSAGES } = require('../helpers/messages')

// function returns true if the given string is a valid type name
const isValidType = (str) => {
  const regex = /^(link|image|text)$/;
  return regex.test(str);
};

// function returns true if the given url is a valid url and type is link
function isValidHttpUrl(str) {
  // if type is not link, we don't care about the url string
  if(this.type === "link") {
    let url;
    try {
      url = new URL(str);
    } catch (_) { 
      return false;
    }
    return url.protocol === "http:" || url.protocol === "https:";
  } else {
    return true;
  }
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

  type: {
    type: String,
    // enum: ["link", "image", "text"],
    validate: [isValidType, POST_MESSAGES.TYPE.INVALID],
    required: [true, POST_MESSAGES.TYPE.BLANK],
    default: "text"
  },

  image: {
    type: String,
    required: [
      function() { return this.type === 'image' },
      POST_MESSAGES.TYPE.IMAGE.BLANK
    ]
  },

  text: {
    type: String,
    required: [
      function() { return this.type === 'text' },
      POST_MESSAGES.TYPE.TEXT.BLANK
    ]
  },

  link: {
    type: String,
    validate: [isValidHttpUrl, POST_MESSAGES.TYPE.LINK.INVALID],
    required: [
      function() { return this.type === 'link' },
      POST_MESSAGES.TYPE.LINK.BLANK
    ]
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