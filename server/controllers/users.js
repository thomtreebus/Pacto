const User = require('../models/User');
const mongoose = require('mongoose');
const {jsonResponse, jsonError} = require("../helpers/responseHandlers");
const errorHandler = require("../helpers/errorHandler");
const University = require("../models/University");
const {USER_MESSAGES} = require("../helpers/messages");


module.exports.updateProfile = async(req, res) => {
  let status = undefined;
  const jsonErrors = [];
  let resMessage = null;
  try {
    const { id } = req.params;
    const { firstName, lastName, personalEmail, course } = req.body;

    // if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No user with id: ${id}`);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      status = 404;
      throw Error(USER_MESSAGES.DOES_NOT_EXIST);
    }
    if (req.user._id.toString() !== id.toString()) {
      status = 401;
      throw Error(USER_MESSAGES.UPDATE_OTHER_PROFILE_UNAUTHORISED)
    }
    const updatedUser = await User.findByIdAndUpdate(id, { ...req.body }, {runValidators: true});
    status = 200

    const university = req.user.university;
    resMessage = await User.findOne({university, _id: req.params.id}).populate(
      {path: 'university', model: University}
    );
  } catch (err) {
    // When status code is not defined use status 500
    if(!status){
      status = 500;
    }
    // converts error array into json array.
    const fieldErrors = errorHandler(err);
    if(fieldErrors.length !== 0){
      fieldErrors.forEach((myErr) => jsonErrors.push(myErr));
    }
    else {
      jsonErrors.push(jsonError(null, err.message));
    }
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
  req.flash('success', USER_MESSAGES.SUCCESSFUL_DELETE);
}