const mongoose = require('mongoose');
const { PACT_MESSAGES } = require('../helpers/messages');
const Schema = mongoose.Schema;

let PactSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, PACT_MESSAGES.NAME.BLANK],
    maxLength: [33, PACT_MESSAGES.NAME.MAX_LENGTH_EXCEEDED],
    minLength: [2, PACT_MESSAGES.NAME.MIN_LENGTH_NOT_MET]
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
    required: [true, PACT_MESSAGES.CATEGORY.BLANK],
    default: "other"
  },

  description: {
    type: String,
    required: [true, PACT_MESSAGES.DESCRIPTION.BLANK],
    default: "A Pact that doesn't know what it wants to be...",
    maxLength: [255, PACT_MESSAGES.DESCRIPTION.MAX_LENGTH_EXCEEDED]
  },
  
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],

  moderators: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],

  image: {
    type: String,
    default: "https://avatars.dicebear.com/api/identicon/temp.svg"
  },

  posts: [{
    type: Schema.Types.ObjectId,
    ref: 'Post'
  }]

  // EVENTS TO BE ADDED

});

PactSchema.pre('validate',  function(next) {
  if(this.image.includes('dicebear.com')) {
    this.image = `https://avatars.dicebear.com/api/identicon/${this.name}.svg`
  }
  next();
});

PactSchema.index({ name: 1, university: 1}, { unique: true });

const Pact = mongoose.model('Pacts', PactSchema);
module.exports = Pact;