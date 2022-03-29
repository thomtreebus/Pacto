const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { jsonResponse, jsonError } = require("../helpers/responseHandlers");
const { MESSAGES } = require("../helpers/messages");

/**
 * Middleware to check that the user is NOT authenticated.
 * Returns an error if the user is logged in.
 * @param {Request} req - The request
 * @param {Response} res - The response to the request
 * @param {*} next - The next function to be executed
 * @async
 */
const checkNotAuthenticated = async (req, res, next) => {
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