const User = require('../models/User');
const mongoose = require('mongoose');
const {jsonResponse, jsonError} = require("../helpers/responseHandlers");
const University = require("../models/University");
const {USER_MESSAGES} = require("../helpers/messages");
const FriendRequest = require('../models/FriendRequest');

module.exports.updateProfile = async(req, res) => {
  let status = undefined;
  let jsonErrors = [];
  let resMessage = null;
  try {
    const { id } = req.params;
    const { firstName, lastName, personalEmail, course } = req.body;

    // if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No user with id: ${id}`);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      status = 404;
      throw Error(USER_MESSAGES.DOES_NOT_EXIST);
    } else if (req.user._id.toString() !== id.toString()) {
      status = 401;
      throw Error(USER_MESSAGES.UPDATE_OTHER_PROFILE_UNAUTHORISED)
    } else {
      const updatedUser = await User.findByIdAndUpdate(id, { ...req.body }, {runValidators: true});
      status = 200
      const university = req.user.university;
      resMessage = await User.findOne({university, _id: req.params.id});
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


module.exports.viewProfile = async(req, res) => {
  let status = 400;
  try {
    const university = req.user.university;
    const { id } = req.params;

    if (!university){
			throw Error(USER_MESSAGES.UNIVERSITY_NOT_SET);
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      status = 404;
      throw Error(USER_MESSAGES.DOES_NOT_EXIST);
    }

    const user = await User.findOne({ university, _id:req.params.id }).populate(
      {path: 'university', model: University}
    );

		if (!user){
			status = 404;
			throw Error(USER_MESSAGES.DOES_NOT_EXIST);
    }

    if (user.active === false){
      status = 423
      throw Error(USER_MESSAGES.NOT_ACTIVE)
    }

    // await user.populate({ path: 'user', model: User })

    res.status(200).json(jsonResponse(user, []));

  } catch (err) {
    res.status(status).json(jsonResponse(null, [jsonError(null, err.message)]));
  }
}

module.exports.allUniUsers = async(req, res) => {
  let status = 400;
  try {
    const university = req.user.university;

    if (!university){
      throw Error("User not authenticated");
    }

    const users = await User.find({university}).populate(
      {path: 'university', model: University}
    );

    // await users.populate({ path: 'users', model: User })

    res.status(200).json(jsonResponse(users, []));

  } catch (err) {
    res.status(status).json(jsonResponse(null, [jsonError(null, err.message)]));
  }
}

module.exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  await User.findByIdAndDelete(id);
  req.flash('success', 'Successfully deleted account!');
}