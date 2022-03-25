const { jsonError } = require("../helpers/responseHandlers");
const { UNIQUE_MESSAGE } = require("../helpers/messages");

const capitaliseFirstLetter = (word) => {
  return (word.charAt(0).toUpperCase() + word.slice(1));
}

const getUniqueError = (field) => {
  return `${field !== 'uniEmail' ?  capitaliseFirstLetter(field) : 'Email' } ${UNIQUE_MESSAGE}`
}

// Helper function returns to give us errors as a json array.
const errorHandler = (err) => {
  let fieldErrors = [];
	if(err.code === 11000){
    const field = Object.keys(err.keyValue)[0];
    fieldErrors.push(jsonError(field, getUniqueError(field)));
	}

  if (err.message.toLowerCase().includes('validation failed')){
    Object.values(err.errors).forEach((properties) => {
      fieldErrors.push(jsonError(properties.path, properties.message));
    });
  }
  return fieldErrors;
}

// Helper function returns a list of errors in an easily readable format.
const getErrorList = (err) => {
  let jsonErrors = [];
  const allErrors = errorHandler(err);
    if(allErrors){
			allErrors.forEach((myErr) => jsonErrors.push(myErr));
		} 
		else {
			jsonErrors.push(jsonError(null, err.message));
		}
	return jsonErrors;
}

module.exports = getErrorList;