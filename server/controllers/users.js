const User = require('../models/User');


module.exports.updateProfile = async(req, res) => {
  const { id } = req.params; 
  console.log(req.body);
  const { firstName, lastName, personalEmail, course } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No user with id: ${id}`);

  const user = await User.findByIdAndUpdate(id, { firstName, lastName, personalEmail, course });

  req.flash('success', 'Successfully updated profile!');

}

module.exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  await User.findByIdAndDelete(id);
  req.flash('success', 'Successfully deleted account!');
}