const User = require("../../models/User");
const Notification = require("../../models/Notification");
const { findByIdAndUpdate } = require("../../models/User");

/**
 * Send a notification to a given user
 * 
 * @param user - User to send the notification to
 * @param text - The notification text
 */
async function createNotification(user, text) {
  const notification = await Notification.create({ user: user, text: text });
  await User.findByIdAndUpdate(user._id, { $push:{ notifications: notification._id} });
}

module.exports.createNotification = createNotification;