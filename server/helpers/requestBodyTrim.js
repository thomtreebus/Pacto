/**
 * This function trims the field to remove any whitespaces.
 * @param req express request field
 * @param field the field to be trimmed
 */
module.exports.requestBodyFieldTrim = (req, field) => {
  if(req.body[field]!== undefined){
    req.body[field] = req.body[field].trim();
  }
  return req;
}