const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { jsonResponse, jsonError } = require("../helpers/responseHandlers");
const University = require('../models/University');

const checkAuthenticated = async (req, res, next) => {
  const token = req.cookies.jwt;

  if (token) {
    jwt.verify(token, "kekw", async (err, decodedToken) => {
      if (err) {
        res.cookie("jwt", "", { maxAge: 1 });
        res
          .status(401)
          .json(jsonResponse(null, [jsonError(null, "You have to login")]));
      } 
      else {

        try {
          let user = await User.findById(decodedToken.id);
          await user.populate({path: 'university', model: University});
          req.user = user;

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
      .json(jsonResponse(null, [jsonError(null, "You have to login")]));
  }
};

module.exports = { checkAuthenticated };
