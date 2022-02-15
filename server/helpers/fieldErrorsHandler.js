const {jsonError} = require("./responseHandlers");
const {MESSAGES} = require("./messages");

handleFieldErrors = (err) => {
  let fieldErrors = [];
  if(err.code === 11000){
    fieldErrors.push(jsonError('uniEmail', MESSAGES.EMAIL.NOT_UNIQUE));
  }
  if (err.message.includes('Users validation failed')) {
    Object.values(err.errors).forEach((properties) => {
      fieldErrors.push(jsonError(properties.path, properties.message));
    });
  }
  return fieldErrors;
}

module.exports = handleFieldErrors;