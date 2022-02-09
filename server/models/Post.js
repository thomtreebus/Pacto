const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = mongoose.Schema({
  pact: {
    type: Schema.Types.ObjectId,
    ref: 'Pact',
    required: true
  },

  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  title: {
    type: String,
    required: true
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
    required: true,
    default: "text"
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

  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  }],

});

const Post = mongoose.model('Posts', PostSchema);

module.exports = Post;