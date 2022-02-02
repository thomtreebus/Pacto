const mongoose = require('mongoose');
const { isEmail } = require('validator')
const ApiCache = require('../helpers/ApiCache')

const isUniEmail = async (email) => {
  // only including .ac.uk domain
  // const regex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9]+\.ac\.uk$/;
  const res = await ApiCache("http://universities.hipolabs.com/search?country=United%20Kingdom");
  const domains = res.flatMap(x => '@'+x['domains']);
  let found = false;
  for(let x=0; x< domains.length; x++){
    if(email.includes(domains[x])){
      found = true
    }
  }
  return found
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

const User = mongoose.model('Users', UserSchema);

module.exports = User;