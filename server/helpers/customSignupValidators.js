const passwordValidator = require('password-validator');
const { MESSAGES } = require('./messages');

/**
 * Validators for ensuring a user's password doesn't break any constraints
 * A password must:
 * - Be at least 8 characters long
 * - Be no longer than 64 characters
 * - Contain at least one uppercase letter
 * - Contain at least one lowercase letter
 * - Contain at least one digit
 */
module.exports.passwordValidators = [
  {
    // Password must be at least 8 characters long
    validator: (password) => (new passwordValidator()).is().min(8).validate(password),
    message: MESSAGES.PASSWORD.MIN_LENGTH_NOT_MET
  },
  {
    // Password must be no longer than 64 characters
    validator: (password) => (new passwordValidator()).is().max(64).validate(password),
    message: MESSAGES.PASSWORD.MAX_LENGTH_EXCEEDED
  },
  {
    // Password must contain at least one uppercase letter
    validator: (password) => (new passwordValidator()).has().uppercase().validate(password),
    message: MESSAGES.PASSWORD.NO_UPPERCASE
  },
  {
    // Password must contain at least one lowercase letter
    validator: (password) => (new passwordValidator()).has().lowercase().validate(password),
    message: MESSAGES.PASSWORD.NO_LOWERCASE
  },
  {
    // Password must contain at least one digit
    validator: (password) => (new passwordValidator()).has().digits(1).validate(password),
    message: MESSAGES.PASSWORD.NO_NUMBERS
  },
]