const User = require('../models/User');
const FriendRequest = require('../models/FriendRequest');
const Notification = require('../models/Notification');
const { FRIEND_MESSAGES } = require('../helpers/messages');
const {jsonResponse, jsonError} = require("../helpers/responseHandlers");

/**
 * Sends a friend request to a user.
 * It fails if the user making the request is already a friend of the recipient,
 * or either of them already sent a request to the other.
 * @param {Request} req - The request
 * @param {Response} res - The response to the request
 * @async
 */
module.exports.sendFriendRequest = async (req, res) => {
  try {
    const user = req.user;

    const { id } = req.params;
    const recipient = await User.findById(id);

    if(user._id.toString() === id) {
      res.status(400).json(jsonResponse(null, [jsonError(null, FRIEND_MESSAGES.REQUEST.SELF)]));
    } else if(user.receivedRequests.filter(r => r.requestor._id.toString() === id).length !== 0) {
      res.status(400).json(jsonResponse(null, [jsonError(null, FRIEND_MESSAGES.REQUEST.ALREADY.RECEIVED)]));
    } else if(user.sentRequests.filter(r => r.recipient._id.toString() === id).length !== 0) {
      res.status(400).json(jsonResponse(null, [jsonError(null, FRIEND_MESSAGES.REQUEST.ALREADY.SENT)]));
    } else if (recipient.friends.includes(user._id)){
      res.status(400).json(jsonResponse(null, [jsonError(null, FRIEND_MESSAGES.ALREADY_FRIEND)]));
    } else {
      // Send the request 
      const friendRequest = await FriendRequest.create({ requestor: user, recipient: recipient });

      await User.findByIdAndUpdate(user._id, { $push: { sentRequests: friendRequest._id } });
      await User.findByIdAndUpdate(id, { $push: { receivedRequests: friendRequest._id } });

      // Notify recipient that they have received a new friend request
      const notification = await Notification.create({ user: recipient._id, text: `${user.firstName} ${user.lastName} has sent you a friend request` });
		  await User.findByIdAndUpdate(recipient._id, { $push: { notifications: notification._id } }); 

      res.status(201).json(jsonResponse(friendRequest, []));
    }
  } catch (err) {
    res.status(400).json(jsonResponse(null, [jsonError(null, err.message)]));
  }
}

/**
 * Accepts a friend request, so the requestor and the recipient
 * become friends.
 * If it succeeds, the friend request is then deleted.
 * @param {Request} req - The request
 * @param {Response} res - The response to the request
 * @async
 */
module.exports.acceptFriendRequest = async (req, res) => {
  const recipient = req.user;
  const { id } = req.params;

  let friendRequest = null;
  try {
    friendRequest = await FriendRequest.findById(id);
    if(!friendRequest) {
      throw Error(FRIEND_MESSAGES.REQUEST.NOT_FOUND);
    }
    try {
      if(friendRequest.recipient.toString() === recipient._id.toString()) {
        const requestor = await User.findById(friendRequest.requestor);

        // Add to friends
        await User.findByIdAndUpdate(recipient._id, { $push: { friends: requestor._id } }); 
        await User.findByIdAndUpdate(requestor._id, { $push: { friends: recipient._id } });
  
        // Remove request from users
        await User.findByIdAndUpdate(recipient._id, { $pull: { receivedRequests: id } }); 
        await User.findByIdAndUpdate(requestor._id, { $pull: { sentRequests: id } });
  
        // Delete the friend request
        await FriendRequest.findByIdAndDelete(id);

        // Notify requestor that recipient has accepted request
        const notification = await Notification.create({ user: requestor._id, text: `${recipient.firstName} ${recipient.lastName} has accepted your friend request` });
		    await User.findByIdAndUpdate(requestor._id, { $push: { notifications: notification._id } }); 
  
        res.status(201).json(jsonResponse(null, []));
      } else {
        res.status(400).json(jsonResponse(null, [jsonError(null, FRIEND_MESSAGES.REQUEST.NOT_AUTHORISED.ACCEPT)]));
      }
    } catch(err) {
      res.status(400).json(jsonResponse(null, [jsonError(null, err.message)]));
    }
  } catch(err) {
    res.status(404).json(jsonResponse(null, [jsonError(null, FRIEND_MESSAGES.REQUEST.NOT_FOUND)]));
  }
}

/**
 * Rejects a friend request, so the requestor and the recipient
 * do NOT become friends.
 * If it succeeds, the friend request is then deleted.
 * @param {Request} req - The request
 * @param {Response} res - The response to the request
 * @async
 */
module.exports.rejectFriendRequest = async (req, res) => {
  const recipient = req.user;
  const { id } = req.params;

  let friendRequest = null;
  try {
    friendRequest = await FriendRequest.findById(id);
    if(!friendRequest) {
      throw Error(FRIEND_MESSAGES.REQUEST.NOT_FOUND);
    }
    try {
      if(friendRequest.recipient.toString() === recipient._id.toString()) {
        const requestor = await User.findById(friendRequest.requestor);

        // Remove request from users
        await User.findByIdAndUpdate(recipient._id, { $pull: { receivedRequests: id } });
        await User.findByIdAndUpdate(requestor._id, { $pull: { sentRequests: id } });
  
        // Delete the friend request
        await FriendRequest.findByIdAndDelete(id);
  
        res.status(201).json(jsonResponse(null, []));
      } else {
        res.status(400).json(jsonResponse(null, [jsonError(null, FRIEND_MESSAGES.REQUEST.NOT_AUTHORISED.REJECT)]));
      }
    } catch(err) {
      res.status(400).json(jsonResponse(null, [jsonError(null, err.message)]));
    }
  } catch(err) {
    res.status(404).json(jsonResponse(null, [jsonError(null, FRIEND_MESSAGES.REQUEST.NOT_FOUND)]));
  }
}

/**
 * Removes a user from the friends list, it fails if the user was not a friend.
 * Removing a friend happens for both users, even if it is requested only by 1 of them.
 * @param {Request} req - The request
 * @param {Response} res - The response to the request
 * @async
 */
module.exports.deleteFriend = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const friendToRemove = await User.findById(id);

    try {
      if(user.friends.includes(id)) {
        // Remove from friends lists
        await User.findByIdAndUpdate(user._id, { $pull: { friends: id } });
        await User.findByIdAndUpdate(friendToRemove._id, { $pull: { friends: user._id } });
  
        res.status(201).json(jsonResponse(null, []));
      } else {
        res.status(400).json(jsonResponse(null, [jsonError(null, FRIEND_MESSAGES.NOT_FRIEND)]));
      } 
    } catch(err) {
      res.status(400).json(jsonResponse(null, [jsonError(null, err.message)]));
    }
  } catch (err) {
    res.status(404).json(jsonResponse(null, [jsonError(null, FRIEND_MESSAGES.NOT_FOUND)]));
  }
}