const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { jsonResponse, jsonError } = require("../helpers/responseHandlers");
const University = require('../models/University');
const { MESSAGES, PACT_MESSAGES } = require("../helpers/messages");
const Pact = require("../models/Pact");

// checkAuthenticated must be run first, or error will throw
const checkIsMemberOfPact = async (req, res, next) => {
  let status = 400;
  try {
    const user = req.user;
    if (!user){
      status = 401;
      throw Error(MESSAGES.AUTH.IS_NOT_LOGGED_IN);
    }

    let pact = null;
		try {
			pact = await Pact.findOne({ university: user.university, _id:req.params.pactId });
		}
		catch (err) {
			pact = null;
		}
    if (!pact) {
      status = 404;
      throw Error(PACT_MESSAGES.NOT_FOUND);
    }

    const id = user._id.toString();

    if(pact.members.map(usr => usr.toString()).includes(id)){
      req.pact = pact;
      next();
    } else {
      status = 401;
      throw Error(PACT_MESSAGES.NOT_AUTHORISED);
    }
  }
  catch (err) {
    res.status(status).json(jsonResponse(null, [jsonError(null, err.message)]));
  }
};

const checkIsModeratorOfPact = async (req, res, next) => {
  let status = 400;
  try {
    const user = req.user;
    const pact = await Pact.findOne({ university: user.university, _id:req.params.pactId });

    const id = user._id.toString();

    if(pact.moderators.map(usr => usr.toString()).includes(id)){
      req.pact = pact;
      next();
    } else {
      status = 401;
      throw Error(PACT_MESSAGES.NOT_MODERATOR);
    }
  }
  catch (err) {
    res.status(status).json(jsonResponse(null, [jsonError(null, err.message)]));
  }
}

module.exports = { checkIsMemberOfPact, checkIsModeratorOfPact };
