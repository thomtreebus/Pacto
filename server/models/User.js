const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { isEmail } = require('validator');
const { MESSAGES } = require('../helpers/messages')

/**
 * Check if the given string does not contain numbers
 * @param {String} str - The given type name
 * @returns true if the given string does not contain numbers
 */
const containsNoNumbers = (str) => {
  const regex = /^[^0-9]+$/;
  return regex.test(str);
};

/**
 * User model used for authentication and pact participation
 */
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
  // Course user is storing at university
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
  // Pacts a user is a member or moderator in
  pacts: [{
    type: Schema.Types.ObjectId,
    ref: 'Pact'
  }],
  notifications: [{
    type: Schema.Types.ObjectId,
    ref: 'Notification'
  }],
  // Profile image
  image: {
    type: String,
    default: "https://res.cloudinary.com/djlwzi9br/image/upload/v1644582632/pacto-logo_zzeh98.png"
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
  // Friend requests a user has sent
  sentRequests: [
    {
      type: Schema.Types.ObjectId,
      ref: 'FriendRequest'
    }
  ],
  // Friend requests a user has received
  receivedRequests: [
    {
      type: Schema.Types.ObjectId,
      ref: 'FriendRequest'
    }
  ],
  friends: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: []
    },
  ],
  // Instagram username
  instagram: {
    type: String,
    required: false
  },
  // Linkedin name
  linkedin: {
    type: String,
    required: false
  },
  phone: {
    type: String,
    required: false
  }

});

const User = mongoose.model('Users', UserSchema);

module.exports = User;