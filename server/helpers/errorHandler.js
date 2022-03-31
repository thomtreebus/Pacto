const { jsonError } = require("../helpers/responseHandlers");
const { UNIQUE_MESSAGE } = require("../helpers/messages");

/**
 * Capitilises the 1st letter of the given word
 * @param {String} word 
 * @returns The capitalised word
 */
const capitaliseFirstLetter = (word) => {
  return (word.charAt(0).toUpperCase() + word.slice(1));
}

/**
 * Helper method, constructs the String "(field name) is already in use."
 * @param {String} field 
 * @returns The string
 */
const getUniqueError = (field) => {
  return `${field !== 'uniEmail' ?  capitaliseFirstLetter(field) : 'Email' } ${UNIQUE_MESSAGE}`
}

/**
 * Helper function, returns errors as a json array.
 * @param {[Error]} err - List of errors
 */
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

/**
 * Helper function, returns a list of errors in an easily readable format.
 * @param {[Error]} err - List of errors
 */
const getErrorList = (err) => {
  let jsonErrors = [];
  const allErrors = errorHandler(err);
  allErrors.forEach((myErr) => jsonErrors.push(myErr));
	return jsonErrors;
}

module.exports = getErrorList;