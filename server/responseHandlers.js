module.exports.jsonResponse = (myMessage, myErrors) => {
  return ({
    message: myMessage,
    errors: myErrors
  });
}

module.exports.jsonError = (myField, myMessage) => {
  return ({
    field: myField,
    message: myMessage
  });
}