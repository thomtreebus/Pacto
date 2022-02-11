const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { jsonResponse, jsonError } = require("../helpers/responseHandlers");
const { MESSAGES } = require("../helpers/messages");

const checkNotAuthenticated = (req, res, next) => {
  const token = req.cookies.jwt;

  if (token) {
    jwt.verify(token, "kekw", async (err, decodedToken) => {
      if (err) {
        // is not logged in 
        next();
      } 
      else {
        res
          .status(401)
          .json(jsonResponse(null, [jsonError(null, MESSAGES.AUTH.IS_LOGGED_IN)]));
      }
    });
  } 
  else {
    // is not logged in 
    next();
  }
};

module.exports = { checkNotAuthenticated };