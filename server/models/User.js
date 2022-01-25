const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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
  }
});

const User = mongoose.model('Users', UserSchema);

UserSchema.pre('save', async function(next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = User;