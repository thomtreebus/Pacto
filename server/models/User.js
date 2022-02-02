const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
  url: String,
  filename: String
});

const UserSchema = Schema({
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
  university: {
    type: String,
    required: false
  },
  active: { // Stores whether the user's email has been verified.
    type: Boolean,
    required: true,
    default: false
  },
  image: ImageSchema,
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


});

const User = mongoose.model('Users', UserSchema);

module.exports = User;