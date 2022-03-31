const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * University model for storing pacts and users belonging to a particular UK university
 */
const UniversitySchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  
  // Valid email domains (ex: King's - kcl.ac.uk)
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