const mongoose = require('mongoose');
const { isEmail } = require('validator')

const isUniEmail = (email) => {
  // only including .ac.uk domain
  regex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9]+\.ac\.uk$/;
  return regex.test(email);
};

const containsNoNumbers = (str) => {
  const regex = /^[^0-9]+$/;
  return regex.test(str);
};

const isLowerCase = (str) => {
  return str === str.toLowerCase();
}

const UserSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Provide the first name'],
    validate: [containsNoNumbers, "Provide firstName without number"],
    maxLength: [16, "Provide firstName shorter than 16 characters"]
  },
  lastName: {
    type: String,
    required: [true, 'Provide the last name'],
    validate: [containsNoNumbers, "Provide lastName without number"],
    maxLength: [16, "Provide lastName shorter than 16 characters"]
  },
  personalEmail: {
    type: String,
    required: false,
    validate: [
      {validator: isEmail , msg: "Provide a valid email format"},
      {validator: isLowerCase, msg: "Provide lowercase email"},
    ],
    lowercase: [true, "Provide lowercase email"]
  },
  uniEmail: {
    // Email must be @xxx.ac.uk
    type: String,
    required: [true, 'Provide the email'],
    unique: true,
    validate: [
      {validator: isEmail , msg: "Provide a valid email format"},
      {validator: isLowerCase, msg: "Provide lowercase email"},
      {validator: isUniEmail, msg: "Provide a uni email"}
    ],
  },
  password: {
    type: String,
    required: [true, 'Provide the password'],
  },
  course: {
    type: String,
    required: false 
  },
  active: { // This stores whether the user's email has been verified.
    type: Boolean,
    required: [true, 'Provide the active flag'],
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