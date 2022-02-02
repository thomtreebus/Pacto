const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PactSchema = mongoose.Schema({
  university: {
    type: Schema.Types.ObjectId,
    ref: 'University',
    required: true
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