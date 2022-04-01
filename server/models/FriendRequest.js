const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * FriendRequest model for tracking a user sending another user a request.
 */
const FriendRequestSchema = mongoose.Schema({
  // Person that is sending the friend request
  requestor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // User receiving the request
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
});

const FriendRequest = mongoose.model('FriendRequests', FriendRequestSchema);
module.exports = FriendRequest;