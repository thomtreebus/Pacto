const User = require('../models/User');
const mongoose = require('mongoose');
const {jsonResponse, jsonError} = require("../helpers/responseHandlers");


module.exports.updateProfile = async(req, res) => {
  let status = 400;
  try {
    const { id } = req.params; 

    // if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No user with id: ${id}`);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      status = 404;
      throw Error("User does not exist");
    }
    const updatedUser = await User.findByIdAndUpdate(id, { ...req.body }).catch((error) => {
      status = 500;
    });

  } catch (err) {
    res.status(status).json(jsonResponse(null, [jsonError(null, err.message)]));
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

    const user = await User.findOne({ university, _id:req.params.id });

		if (!user){
			status = 404;
			throw Error("User not found");
    }

    // await user.populate({ path: 'user', model: User })
    
    res.status(200).json(jsonResponse(pact, []));

  } catch (err) {
    res.status(status).json(jsonResponse(null, [jsonError(null, err.message)]));
  }
}

module.exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  await User.findByIdAndDelete(id);
  req.flash('success', 'Successfully deleted account!');
}