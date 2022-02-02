const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { isEmail } = require('validator')

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