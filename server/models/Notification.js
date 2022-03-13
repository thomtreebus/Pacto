const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotificationSchema = mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  text: {
    type: String,
    required: true
  },

  time: {
    type: Date,
    default: Date.now
  },

  read: {
    type: Boolean,
    default: false
  }

});

const Notification = mongoose.model('Notifications', NotificationSchema);

module.exports = Post;