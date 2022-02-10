const User = require('../models/User');
const mongoose = require('mongoose');
const {jsonResponse, jsonError} = require("../helpers/responseHandlers");


module.exports.updateProfile = async(req, res) => {
  try {
    const { id } = req.params; 

    // if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No user with id: ${id}`);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw Error("User does not exist");
    }
    const updatedUser = await User.findByIdAndUpdate(id, { ...req.body });

  } catch (err) {
    res.status(status).json(jsonResponse(null, [jsonError(null, err.message)]));
  }
}

module.exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  await User.findByIdAndDelete(id);
  req.flash('success', 'Successfully deleted account!');
}