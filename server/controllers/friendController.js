const User = require('../models/User');
const FriendRequest = require('../models/FriendRequest');
const { FRIEND_MESSAGES } = require('../helpers/messages');
const {jsonResponse, jsonError} = require("../helpers/responseHandlers");

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

      res.status(201).json(jsonResponse(friendRequest, []));
    }
  } catch (err) {
    res.status(400).json(jsonResponse(null, [jsonError(null, err.message)]));
  }
}

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

module.exports.removeFriend = async (req, res) => {
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