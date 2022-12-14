const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { POST_MESSAGES } = require('../helpers/messages')

/**
 * Check if the given string is a valid type name (link, image or text).
 * @param {String} str - The given type name
 * @returns true if the given string is a valid type name
 */
const isValidType = (str) => {
  const regex = /^(link|image|text)$/;
  return regex.test(str);
};

/**
 * Checks if the given url is a valid url and the type of the post is link
 * @param {String} str - The URL
 * @returns true if the given url is a valid url and the type of the post is {link}
 */
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

/**
 * Post model for pact posts. Posts can be of 3 different types: text, image, and link
 * Text posts have a piece of text as body
 * Image posts display an image
 * Link posts are used to share a URL
 * The model stores information about the post as well as the post's comments
 */
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
    maxLength: [200, POST_MESSAGES.TITLE.MAX_LENGTH_EXCEEDED],
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
    maxLength: [3000, POST_MESSAGES.TYPE.TEXT.MAX_LENGTH_EXCEEDED],
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

  // Net number of upvotes/downvotes
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