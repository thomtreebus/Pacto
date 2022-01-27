const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { jsonResponse, jsonError } = require("../helpers/responseHandlers");

const checkAuthenticated = (req, res, next) => {
  const token = req.cookies.jwt;

  if (token) {
    jwt.verify(token, "kekw", async (err, decodedToken) => {
      if (err) {
        res
          .status(401)
          .json(jsonResponse(null, [jsonError(null, "You have to login")]));
      } else {
        let user = await User.findById(decodedToken.id);
        req.user = user;
        next();
      }
    });
  } else {
    res
      .status(401)
      .json(jsonResponse(null, [jsonError(null, "You have to login")]));
  }
};

module.exports = { checkAuthenticated };
