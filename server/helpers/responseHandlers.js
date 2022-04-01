/**
 * Returns a json object composed of a message, and 
 * a list of errors.
 * @param {String} myMessage 
 * @param {[JSON]} myErrors 
 * @returns The json object
 */
module.exports.jsonResponse = (myMessage, myErrors) => {
  return ({
    message: myMessage,
    errors: myErrors
  });
}

/**
 * Returns a json object composed of a field name,
 * and an error description.
 * @param {String} myField 
 * @param {String} myMessage 
 * @returns The json object
 */
module.exports.jsonError = (myField, myMessage) => {
  return ({
    field: myField,
    message: myMessage
  });
}