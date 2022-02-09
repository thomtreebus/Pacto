const passwordValidator = require('password-validator');
const { MESSAGES } = require('./messages');

module.exports.passwordValidators = [
  {
    validator: (password) => (new passwordValidator()).is().min(8).validate(password),
    message: MESSAGES.PASSWORD.MIN_LENGTH_NOT_MET
  },
  {
    validator: (password) => (new passwordValidator()).is().max(64).validate(password),
    message: MESSAGES.PASSWORD.MAX_LENGTH_EXCEEDED
  },
  {
    validator: (password) => (new passwordValidator()).has().uppercase().validate(password),
    message: MESSAGES.PASSWORD.NO_UPPERCASE
  },
  {
    validator: (password) => (new passwordValidator()).has().lowercase().validate(password),
    message: MESSAGES.PASSWORD.NO_LOWERCASE
  },
  {
    validator: (password) => (new passwordValidator()).has().digits(1).validate(password),
    message: MESSAGES.PASSWORD.NO_NUMBERS
  },
]