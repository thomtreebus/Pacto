const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { jsonResponse, jsonError } = require("../helpers/responseHandlers");
const University = require('../models/University');
const { MESSAGES } = require("../helpers/messages");

const checkAuthenticated = async (req, res, next) => {
  const token = req.cookies.jwt;

  if (token) {
    jwt.verify(token, "kekw", async (err, decodedToken) => {
      if (err) {
        res
          .status(401)
          .json(jsonResponse(null, [jsonError(null, MESSAGES.AUTH.IS_NOT_LOGGED_IN)]));
      } 
      else {
        let user = await User.findById(decodedToken.id);
        await user.populate({path: 'university', model: University});
        req.user = user;

        if(!user.active){
          //throw Error("User has not verified their email");
          res
          .status(401)
          .json(jsonResponse(null, [jsonError(null, MESSAGES.AUTH.IS_INACTIVE)]));
        }

        next();
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
