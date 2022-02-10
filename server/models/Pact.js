const mongoose = require('mongoose');
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
    required: true
  },

  category: {
    type: String,
    enum: ["society", "subject", "module", "other"],
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