const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
  image: {
    type: String,
    default: "https://res.cloudinary.com/djlwzi9br/image/upload/v1644324688/gxflstl5ivocqp7pswav.png"
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
  instagram: {
    type: String,
    required: false
  }, 
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