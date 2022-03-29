const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { jsonResponse, jsonError } = require("../helpers/responseHandlers");
const University = require('../models/University');
const { MESSAGES } = require("../helpers/messages");
const FriendRequest = require('../models/FriendRequest');

/**
 * Middleware to check that the user is authenticated.
 * Adds the user field to the request if the user is authenticated.
 * Returns an error if the user is inactive or is not logged in.
 * @param {Request} req - The request
 * @param {Response} res - The response to the request
 * @param {*} next - The next function to be executed
 * @async
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
