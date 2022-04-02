const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Notification model for user notifications
 */
const NotificationSchema = mongoose.Schema({
  // User the notification is sent to
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
  // Whether the user has seen/read the notification
  read: {
    type: Boolean,
    default: false
  }

});

const Notification = mongoose.model('Notifications', NotificationSchema);

module.exports = Notification;