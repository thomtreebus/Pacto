const User = require('../models/User');
const {jsonResponse, jsonError} = require("../helpers/responseHandlers");
const Notification = require("../models/Notification");
const { NOTIFICATION_MESSAGES } = require("../helpers/messages");

module.exports.getNotifications = async (req, res) => {
  let notifications = null;
  try {
    notifications = await Notification.find({ user: req.user._id, read: false });
    try {
			res.status(200).json(jsonResponse(notifications, []));
		} 
		catch (err) {
			res.status(400).json(jsonResponse(null, [jsonError(null, err.message)]));
		}
	}
	catch (err) {
		res.status(404).json(jsonResponse(null, [jsonError(null, NOTIFICATION_MESSAGES.NOT_FOUND)]));
	}
}

module.exports.markAsRead = async (req, res) => {
	try {
		const notification = await Notification.findOne({ _id: req.params.id });
		if (!notification) {
			res.status(404).json(jsonResponse(null, [jsonError(null, NOTIFICATION_MESSAGES.NOT_FOUND)]));
		} else {
			if (notification.user.toString() !== req.user._id.toString()) {
				throw Error(NOTIFICATION_MESSAGES.OTHER_USER)
			}
			// Checking if notification is already read
			if (notification.read === true) {
        throw Error(NOTIFICATION_MESSAGES.ALREADY_READ);
      } else {
        notification.read = true;
      }
			notification.save();
			
			res.status(200).json(jsonResponse(notification, []));
		}
	} 
	catch (err) {
		res.status(400).json(jsonResponse(null, [jsonError(null, err.message)]));
	}
}