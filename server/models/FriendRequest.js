const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FriendRequestSchema = mongoose.Schema({
  requestor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
});

const FriendRequest = mongoose.model('FriendRequests', FriendRequestSchema);
module.exports = FriendRequest;