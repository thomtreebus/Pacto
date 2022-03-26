const Chance = require("chance");
const userConstants = require("./userConstants");
const User = require("../../models/User");
const Notification = require("../../models/Notification");
const { findByIdAndUpdate } = require("../../models/User");

async function createNotification(user, text) {
  const notification = await Notification.create({ user: user, text: text });
  await User.findByIdAndUpdate(user._id, { $push:{ notifications: notification._id} });
}

module.exports.createNotification = createNotification;