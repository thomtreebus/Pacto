const mongoose = require('mongoose');
const { isEmail } = require('validator')

const isUniEmail = (email) => {
  if ( isEmail(email) ) {
    // only including .ac.uk domain
    acUkRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9]+\.ac\.uk$/
    return acUkRegex.test(email);
  }
  return false
};

const containsNoNumbers = (str) => {
  regex = /^[^0-9]+$/
  return regex.test(str)
};

const UserSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please enter a first name'],
    validate: [containsNoNumbers, "Name can't contain number"]
  },
  lastName: {
    type: String,
    required: [true, 'Please enter a last name'],
    validate: [containsNoNumbers, "Name can't contain number"]
  },
  personalEmail: {
    type: String,
    required: false,
    validate: [isEmail , "Must be a valid email"]
  },
  uniEmail: {
    // Email must be @xxx.ac.uk
    type: String,
    required: [true, 'Please enter an email'],
    unique: true,
    validate: [isUniEmail, 'Enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please enter a password'],
  },
  course: {
    type: String,
    required: false 
  },
  active: { // This stores whether the user's email has been verified.
    type: Boolean,
    required: [true, 'Please provide the active flag for User'],
    default: false
  }
});


// Duplicate email check
// https://stackoverflow.com/questions/38945608/custom-error-messages-with-mongoose
// Responses are outdated, error name is now MongoServerError
UserSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    next(new Error('Email already exists'));
  } else {
    next(error);
  }
});

const User = mongoose.model('Users', UserSchema);

module.exports = User;