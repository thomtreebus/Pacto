const User = require('../models/User');
const FriendRequest = require('../models/FriendRequest');
const { FRIEND_MESSAGES, FRIEND_REQUEST_MESSAGES } = require('../helpers/messages');
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

  const user = await User.findByIdAndUpdate(id, { firstName, lastName, personalEmail, course });
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

module.exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  await User.findByIdAndDelete(id);
  req.flash('success', 'Successfully deleted account!');
}

module.exports.sendFriendRequest = async (req, res) => {
  try {
    const user = req.user;

    const { recipientId } = req.params;
    const recipient = await User.findById(recipientId);

    if(user.sentRequests.filter(r => r.recipient === recipientId).length !== 0) {
      res.status(400).json(jsonResponse(null, [jsonError(null, FRIEND_REQUEST_MESSAGES.ALREADY_SENT)]));
    } else if (recipient.friends.includes(user._id)){
      res.status(400).json(jsonResponse(null, [jsonError(null, FRIEND_MESSAGES.ALREADY_FRIEND)]));
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
    const recipient = req.user;

    const { friendRequestId } = req.params;
    const friendRequest = await FriendRequest.findById(friendRequestId);

    if(friendRequest.recipient === recipient._id) {
      const requestor = User.findById(friendRequest.requestor);

      // Remove request from users
      await User.findByIdAndUpdate(recipient._id, { $pull: { receivedRequests: friendRequestId } });
      await User.findByIdAndUpdate(requestor._id, { $pull: { sentRequests: friendRequestId } });

      // Delete the friend request
      await FriendRequest.findByIdAndDelete(friendRequestId);

      res.status(201).json(jsonResponse(null, []));
    } else {
      res.status(400).json(jsonResponse(null, [jsonError(null, FRIEND_REQUEST_MESSAGES.NOT_AUTHORISED.REJECT)]));
    }
	} 
  catch (err) {
		res.status(400).json(jsonResponse(null, [jsonError(null, err.message)]));
	}
}

module.exports.removeFriend = async (req, res) => {
  try {
    const user = req.user;

    const { friendToRemoveId } = req.params;
    const friendToRemove = await User.findById(friendToRemoveId);

    if(user.friends.includes(friendToRemoveId)) {
      // Remove from friends lists
      await User.findByIdAndUpdate(user._id, { $pull: { friends: friendToRemoveId } });
      await User.findByIdAndUpdate(friendToRemove._id, { $pull: { friends: user._id } });

      res.status(201).json(jsonResponse(null, []));
    } else {
      res.status(400).json(jsonResponse(null, [jsonError(null, FRIEND_MESSAGES.NOT_FRIEND)]));
    } 
	} 
  catch (err) {
		res.status(400).json(jsonResponse(null, [jsonError(null, err.message)]));
	}
}