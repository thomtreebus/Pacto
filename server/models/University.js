const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UniversitySchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  
  domains: [{
    type: String,
    required: true
  }],

  users: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],

  pacts: [{
    type: Schema.Types.ObjectId,
    ref: 'Pact'
  }],

});

const University = mongoose.model('Universities', UniversitySchema);

module.exports = University;