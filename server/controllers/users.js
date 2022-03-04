const User = require('../models/User');
const FriendRequest = require('../models/FriendRequest');
const { FRIEND_REQUEST_MESSAGES } = require('../helpers/messages');


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
    if (!mongoose.Types.ObjectId.isValid(recipientId)) return res.status(404).send(`No user with id: ${ recipientId }`);
    const recipient = await User.findById(recipientId);

    if(user.sentRequests.filter(r => r.recipient === recipientId).length !== 0) {
      res.status(400).json(jsonResponse(null, [jsonError(null, FRIEND_REQUEST_MESSAGES.ALREADY_SENT)]));
    } else if (recipient.friends.includes(user._id)){
      res.status(400).json(jsonResponse(null, [jsonError(null, FRIEND_REQUEST_MESSAGES.ALREADY_FRIEND)]));
    } else {
      // Send the request 
      const friendRequest = await FriendRequest.create({ requestor: user, recipient: recipient });

      await User.findByIdAndUpdate(user._id, { $push: { sentRequests: friendRequest._id } });
      await User.findByIdAndUpdate(recipientId, { $push: { receivedRequests: friendRequest._id } });

      res.status(201).json(jsonResponse(null, []));
    }
	} 
  catch (err) {
		res.status(400).json(jsonResponse(null, [jsonError(null, err.message)]));
	}
}

module.exports.acceptFriendRequest = async (req, res) => {
  try {
    const recipient = req.user;

    const { friendRequestId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(friendRequestId)) return res.status(404).send(`No friend request with id: ${friendRequestId}`);
    const friendRequest = await FriendRequest.findById(friendRequestId);

    if(friendRequest.recipient === recipient._id) {
      const requestor = User.findById(friendRequest.requestor);

      // Add to friends
      await User.findByIdAndUpdate(recipient._id, { $push: { friends: requestor._id } });
      await User.findByIdAndUpdate(requestor._id, { $push: { friends: recipient._id } });

      // Remove request from users
      await User.findByIdAndUpdate(recipient._id, { $pull: { receivedRequests: friendRequestId } });
      await User.findByIdAndUpdate(requestor._id, { $pull: { sentRequests: friendRequestId } });

      // Delete the friend request
      await FriendRequest.findByIdAndDelete(friendRequestId);

      res.status(201).json(jsonResponse(null, []));
    } else {
      res.status(400).json(jsonResponse(null, [jsonError(null, FRIEND_REQUEST_MESSAGES.NOT_AUTHORISED.ACCEPT)]));
    }
	} 
  catch (err) {
		res.status(400).json(jsonResponse(null, [jsonError(null, err.message)]));
	}
}

module.exports.rejectFriendRequest = async (req, res) => {
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