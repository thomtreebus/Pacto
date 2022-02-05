const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { isEmail } = require('validator')

// function returns true if it contains no numbers
const containsNoNumbers = (str) => {
  const regex = /^[^0-9]+$/;
  return regex.test(str);
};

// function returns true if it contains no uppercase characters.
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
    ],
  },
  uniEmail: {
    type: String,
    required: [true, 'Provide the email'],
    unique: true
    // Validated in post route
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
  },
  university: {
    type: Schema.Types.ObjectId,
    ref: 'Univeristy',
    required: true
  }
});

const User = mongoose.model('Users', UserSchema);

module.exports = User;