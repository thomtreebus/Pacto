const User = require('../models/User');


module.exports.updateProfile = async(req, res) => {
  const id = req.params.userId; 
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

module.exports.sendFriendRequest = async (req, res) => {
  try {
    const user = req.user;

    const { recipientId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(recipientId)) return res.status(404).send(`No user with id: ${recipientId}`);
    const recipient = await User.findById(recipientId);

    const friendRequest = await FriendRequest.create({ requestor: user, recipient: recipient });

    await User.findByIdAndUpdate(user._id, { $push: { sentRequests: friendRequest } });
    await User.findByIdAndUpdate(recipientId, { $push: { receivedRequests: friendRequest } });

		res.status(201).json(jsonResponse(null, []));
	} 
  catch (err) {
		res.status(400).json(jsonResponse(null, [jsonError(null, err.message)]));
	}
}