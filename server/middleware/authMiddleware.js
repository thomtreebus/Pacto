/**
 * This middleware is a check used before the main module function is called.
 * It checks if the request contains a user with a valid cookie signifying they are logged in.
 */

const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { jsonResponse, jsonError } = require("../helpers/responseHandlers");
const University = require('../models/University');
const { MESSAGES } = require("../helpers/messages");
const FriendRequest = require('../models/FriendRequest');

/**
 * This function checks if the user has a valid cookie.
 * @param req contains information regarding the incoming request.
 * @param res contains information regarding the response.
 * @param next Required parameter for middleware. Signals call of the next function.
 * @returns {Promise<void>}
 */
const checkAuthenticated = async (req, res, next) => {
  const token = req.cookies.jwt;

  if (token) {
    jwt.verify(token, "kekw", async (err, decodedToken) => {
      if (err) {
        res.cookie("jwt", "", { maxAge: 1 });
        res
          .status(401)
          .json(jsonResponse(null, [jsonError(null, MESSAGES.AUTH.IS_NOT_LOGGED_IN)]));
      } 
      else {

        try {
          let user = await User.findById(decodedToken.id);
          await user.populate({path: 'university', model: University});
          await user.populate({path: 'sentRequests', model: FriendRequest});
          await user.populate({path: 'receivedRequests', model: FriendRequest});
          req.user = user;

          if(!user.active){
            res
            .status(401)
            .json(jsonResponse(null, [jsonError(null, MESSAGES.AUTH.IS_INACTIVE)]));
          } else {
            next();
          }
        }
        catch (err) {
          res.cookie("jwt", "", { maxAge: 1 });
          res.status(401).json(jsonResponse(null, [jsonError(null, MESSAGES.AUTH.IS_NOT_LOGGED_IN)]));
        }
      }
    });
  } 
  else {
    res
      .status(401)
      .json(jsonResponse(null, [jsonError(null, MESSAGES.AUTH.IS_NOT_LOGGED_IN)]));
  }
};

module.exports = { checkAuthenticated };
