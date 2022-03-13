const User = require('../models/User');
// const mongoose = require('mongoose');
const {jsonResponse, jsonError} = require("../helpers/responseHandlers");
// const errorHandler = require("../helpers/errorHandler");
const Notification = require("../models/Notification");
const { NOTIFICATION_MESSAGES, MESSAGES } = require("../helpers/messages");


module.exports.getNotifications = async (req, res) => {
  let notifications = null;
  try {
    notifications = await Notification.find({ user: req.user._id });
    try {
      for (let i = 0; i < notifications.length; i++) {
        const notification = notifications[i];
        await notification.populate({ path: 'user', model: User});
      }
      
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