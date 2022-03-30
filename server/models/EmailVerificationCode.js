const mongoose = require('mongoose');

/**
 * The EmailVerificationCodeSchema that stores a user's id and email verification code. 
 * Used for email verification to confirm that a user has a valid UK university email address
 */
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