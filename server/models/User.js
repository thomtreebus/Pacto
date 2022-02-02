const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: true 
  },
  lastName: {
    type: String,
    required: true 
  },
  personalEmail: {
    type: String,
    required: false 
  },
  uniEmail: {
    type: String,
    required: true 
  },
  password: {
    type: String,
    required: true 
  },
  course: {
    type: String,
    required: false 
  },
  active: { // This stores whether the user's email has been verified.
    type: Boolean,
    required: true,
    default: false
  },
  university : {
    type: Schema.Types.ObjectId,
    ref: 'Univeristy'
  }
});

const User = mongoose.model('Users', UserSchema);

module.exports = User;