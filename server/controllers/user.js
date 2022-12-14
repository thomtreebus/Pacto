const User = require('../models/User');
const mongoose = require('mongoose');
const {jsonResponse, jsonError} = require("../helpers/responseHandlers");
const University = require("../models/University");
const {USER_MESSAGES} = require("../helpers/messages");
const FriendRequest = require('../models/FriendRequest');
const {requestBodyFieldTrim} = require("../helpers/requestBodyTrim");

/**
 * Updates the profile of the user making the request.
 * @param {Request} req - The request
 * @param {Response} res - The response to the request
 * @async
 */
module.exports.updateProfile = async(req, res) => {
  let status = undefined;
  let jsonErrors = [];
  let resMessage = null;
  requestBodyFieldTrim(req, "bio");

  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      status = 404;
      throw Error(USER_MESSAGES.DOES_NOT_EXIST);
    } else if (req.user._id.toString() !== id.toString()) {
      status = 401;
      throw Error(USER_MESSAGES.UPDATE_OTHER_PROFILE_UNAUTHORISED)
    } else {
      await User.findByIdAndUpdate(id, { ...req.body }, {runValidators: true});
      status = 200
      const university = req.user.university;
      resMessage = await User.findOne({university, _id: req.params.id}, "-password");
      await resMessage.populate({path: 'university', model: University});
      await resMessage.populate({path: 'sentRequests', model: FriendRequest});
      await resMessage.populate({path: 'receivedRequests', model: FriendRequest});
    }
  } catch (err) {
    // When status code is not defined use status 500
    if(!status){
      status = 500;
    }
    jsonErrors = [jsonError(null, err.message)];
  }
  finally {
    res.status(status).json(jsonResponse(resMessage, jsonErrors));
  }
}

/**
 * Returns the profile of a user.
 * The id of the user is given in the parameters of the request.
 * @param {Request} req - The request
 * @param {Response} res - The response to the request
 * @async
 */
module.exports.getProfile = async(req, res) => {
  let status = 400;
  try {
    const university = req.user.university;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      status = 404;
      throw Error(USER_MESSAGES.DOES_NOT_EXIST);
    }

    const user = await User.findOne({ university, _id:req.params.id}, "-password").populate({path: 'university', model: University});

		if (!user){
			status = 404;
			throw Error(USER_MESSAGES.DOES_NOT_EXIST);
    }

    if (user.active === false){
      status = 423
      throw Error(USER_MESSAGES.NOT_ACTIVE)
    }

    res.status(200).json(jsonResponse(user, []));

  } catch (err) {
    res.status(status).json(jsonResponse(null, [jsonError(null, err.message)]));
  }
}

/**
 * Returns a list of all users in the university of 
 * the user who made the request.
 * @param {Request} req - The request
 * @param {Response} res - The response to the request
 * @async
 */
module.exports.getUniversityUsers = async(req, res) => {
  let status = 400;
  try {
    const university = req.user.university;

    const users = await User.find({university, active: true}).populate(
      {path: 'university', model: University}
    );

    res.status(200).json(jsonResponse(users, []));

  } catch (err) {
    res.status(status).json(jsonResponse(null, [jsonError(null, err.message)]));
  }
}

