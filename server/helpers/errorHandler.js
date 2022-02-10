const { jsonError } = require("../helpers/responseHandlers");
const { MESSAGES } = require("../helpers/messages");

// Helper function returns to give us errors as a json array.
const errorHandler = (err) => {
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

module.exports = errorHandler;