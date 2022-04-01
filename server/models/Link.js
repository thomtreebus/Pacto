const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Link model for storing data used in the link preview for link posts.
 */
const LinkSchema = mongoose.Schema({
  image: {
    type: String,
    required: true
  },

  text: {
    type: String,
    required: true
  },

  link: {
    type: String,
    required: true,
    unique: true
  },
});

const Link = mongoose.model('Links', LinkSchema);

module.exports = Link;