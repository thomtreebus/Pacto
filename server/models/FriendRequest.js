const mongoose = require('mongoose');

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

const FriendRequestSchema = mongoose.model('FriendRequests', EmailVerificationCodeSchema);
module.exports = FriendRequestSchema;