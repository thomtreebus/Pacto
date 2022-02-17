const jwt = require("jsonwebtoken");
const User = require("../models/User");
const User = require("../models/User");
const { jsonResponse, jsonError } = require("../helpers/responseHandlers");
const University = require('../models/University');
const { MESSAGES, PACT_MESSAGES } = require("../helpers/messages");
const Pact = require("../models/Pact");

// checkAuthenticated must be run first, or error will throw
const checkIsMemberOfPact = async (req, res, next) => {
  let status = 400;
  try {
    const pact = await Pact.findById(req.params.id);
    if (!pact) {
      status = 404;
      throw Error(PACT_MESSAGES.NOT_FOUND);
    }

    const user = req.user;

    if(pact.members.includes(user)){
      req.pact = pact;
      next();
    } else {
      status = 401;
      throw Error(PACT_MESSAGES.NOT_AUTHORISED);
    }
  }
  catch (err) {
    res.status(status).json(jsonResponse(null, jsonError(null, err.message)));
  }
};

module.exports = { checkIsMemberOfPact };
