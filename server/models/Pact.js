const mongoose = require('mongoose');
const { PACT_MESSAGES } = require('../helpers/messages');
const Schema = mongoose.Schema;

const PactSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },

  university: {
    type: Schema.Types.ObjectId,
    ref: 'University',
    required: [true, PACT_MESSAGES.UNIVERSITY.BLANK]
  },

  category: {
    type: String,
    enum: {
      values : ["society", "course", "module", "other"],
      message: PACT_MESSAGES.CATEGORY.INVALID_CHOICE 
    },
    required: true,
    default: "other"
  },

  description: {
    type: String,
    required: true,
    default: "A Pact that doesn't know what it wants to be..."
  },
  
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],

  moderators: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],

  // POSTS AND EVENTS TO BE ADDED

});

const Pact = mongoose.model('Pacts', PactSchema);

module.exports = Pact;