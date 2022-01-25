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

userSchema.pre('save', async function(next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// static method to login user
userSchema.statics.login = async function(email, password) {
  const user = await this.findOne({ email });
  if (user) {
    const auth = await bcrypt.compare(password, user.password);
    if (auth) {
      return user;
    }
  }
  throw Error('incorrect credentials');
};

module.exports = mongoose.model('Userrs, UserSchema');