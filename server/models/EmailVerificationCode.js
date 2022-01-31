const mongoose = require('mongoose');

const EmailVerificationCodeSchema = mongoose.Schema({
  userId:{
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true
  }
});

const EmailVerificationCode = mongoose.model('EmailVerificationCodes', EmailVerificationCodeSchema);
module.exports = EmailVerificationCode;