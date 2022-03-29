const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { jsonResponse, jsonError } = require("../helpers/responseHandlers");
const University = require('../models/University');
const { MESSAGES, PACT_MESSAGES } = require("../helpers/messages");
const Pact = require("../models/Pact");

/**
 * IMPORTANT: checkAuthenticated must be run first.
 * 
 * Middleware to check that the user is a member of a pact.
 * The pact's id is given in the parameters of the request.
 * It adds the pact field to the request if the user is a member of the pact.
 * Returns an error if checkAuthenticated is not run first, or the pact is not found.
 * @param {Request} req - The request
 * @param {Response} res - The response to the request
 * @param {*} next - The next function to be executed
 * @async
 */
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

/**
 * IMPORTANT: checkAuthenticated must be run first.
 * 
 * Middleware to check that the user is a moderator of a pact.
 * The pact's id is given in the parameters of the request.
 * It adds the pact field to the request if the user is a moderator of the pact.
 * Returns an error if checkAuthenticated is not run first, or the pact is not found.
 * @param {Request} req - The request
 * @param {Response} res - The response to the request
 * @param {*} next - The next function to be executed
 * @async
 */
const checkIsModeratorOfPact = async (req, res, next) => {
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
