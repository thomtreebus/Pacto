const User = require('../models/User');
const mongoose = require('mongoose');
const {jsonResponse, jsonError} = require("../helpers/responseHandlers");
const errorHandler = require("../helpers/errorHandler");
const University = require("../models/University");


module.exports.updateProfile = async(req, res) => {
  let status = undefined;
  const jsonErrors = [];
  let resMessage = null;
  try {
    const { id } = req.params;

    // if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No user with id: ${id}`);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      status = 404;
      throw Error("User does not exist");
    }
    if (req.user._id.toString() !== id.toString()) {
      status = 401;
      throw Error("Can not update someone else's profile")
    }
    const updatedUser = await User.findByIdAndUpdate(id, { ...req.body });
    status = 200

  } catch (err) {
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
			throw Error("User not authenticated");
    }
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      status = 404;
      throw Error("User does not exist");
    }

    const user = await User.findOne({ university, _id:req.params.id }).populate(
      {path: 'university', model: University}
    );

		if (!user){
			status = 404;
			throw Error("User not found");
    }

    // await user.populate({ path: 'user', model: User })
    
    res.status(200).json(jsonResponse(user, []));

  } catch (err) {
    res.status(status).json(jsonResponse(null, [jsonError(null, err.message)]));
  }
}

module.exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  await User.findByIdAndDelete(id);
  req.flash('success', 'Successfully deleted account!');
}