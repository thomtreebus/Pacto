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

  image: {
    type: String,
    default: "https://avatars.dicebear.com/api/identicon/temp.svg"
  },

  // POSTS AND EVENTS TO BE ADDED

});

PactSchema.pre('validate',  function(next) {
  if(this.image.includes('dicebear.com')) {
    console.log(this.image)
    this.image = `https://avatars.dicebear.com/api/identicon/${this.name}.svg`
  }
  next();
});

const Pact = mongoose.model('Pacts', PactSchema);

module.exports = Pact;