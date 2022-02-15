const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { isEmail } = require('validator');
const { MESSAGES } = require('../helpers/messages')

// function returns true if it contains no numbers
const containsNoNumbers = (str) => {
  const regex = /^[^0-9]+$/;
  return regex.test(str);
};

const ImageSchema = new Schema({
  url: String,
  filename: String
});

const UserSchema = Schema({
  firstName: {
    type: String,
    required: [true, MESSAGES.FIRST_NAME.BLANK],
    validate: [containsNoNumbers, MESSAGES.FIRST_NAME.CONTAINS_NUMBERS],
    maxLength: [50, MESSAGES.FIRST_NAME.MAX_LENGTH_EXCEEDED]
  },
  lastName: {
    type: String,
    required: [true, MESSAGES.LAST_NAME.BLANK],
    validate: [containsNoNumbers, MESSAGES.LAST_NAME.CONTAINS_NUMBERS],
    maxLength: [50, MESSAGES.LAST_NAME.MAX_LENGTH_EXCEEDED]
  },
  personalEmail: {
    type: String,
    required: false,
    validate: [
      {validator: isEmail , msg: MESSAGES.EMAIL.INVALID_FORMAT},
    ],
  },
  uniEmail: {
    type: String,
    required: [true, MESSAGES.EMAIL.BLANK],
    unique: true
    // Validated in post route
  },
  password: {
    type: String,
    required: [true, MESSAGES.PASSWORD.BLANK],
  },
  course: {
    type: String,
    required: false 
  },
  active: { // Stores whether the user's email has been verified.
    type: Boolean,
    required: true,
    default: false
  },
  university: {
    type: Schema.Types.ObjectId,
    ref: 'University',
    required: true
  },
  pacts: [{
    type: Schema.Types.ObjectId,
    ref: 'Pact'
  }],
  image: {
    type: String,
  },
  bio: {
    type: String,
    required: false,
    default: ""
  },
  hobbies: [{
    type: String,
    required: false
  }],
  location: {
    type: String,
    required: false,
    default: ""
  },
  friends: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  pacts: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Pact'
    }
  ],
});

const User = mongoose.model('Users', UserSchema);

module.exports = User;