const User = require('../models/User');
const mongoose = require('mongoose');


module.exports.updateProfile = async(req, res) => {
  const { id } = req.params; 

  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No user with id: ${id}`);

  const updatedUser = await User.findByIdAndUpdate(id, { ...req.body }).catch(error => {
    return res.status(500).send(error);
  });
  console.log(updatedUser);

}

module.exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  await User.findByIdAndDelete(id);
  req.flash('success', 'Successfully deleted account!');
}