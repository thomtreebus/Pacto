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
        res.cookie("jwt", "", { maxAge: 1 });
        res
          .status(401)
          .json(jsonResponse(null, [jsonError(null, MESSAGES.AUTH.IS_NOT_LOGGED_IN)]));
      } 
      else {

<<<<<<< HEAD
        if(!user.active){
          //throw Error("User has not verified their email");
          res
          .status(401)
          .json(jsonResponse(null, [jsonError(null, MESSAGES.AUTH.IS_INACTIVE)]));
        }
=======
        try {
          let user = await User.findById(decodedToken.id);
          await user.populate({path: 'university', model: University});
          req.user = user;
>>>>>>> main

          if(!user.active){
            res
            .status(401)
            .json(jsonResponse(null, [jsonError(null, "User has not verified their email")]));
          } else {
            next();
          }
        }
        catch (err) {
          res.cookie("jwt", "", { maxAge: 1 });
          res.status(401).json(jsonResponse(null, [jsonError(null, "You have to login")]))
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
