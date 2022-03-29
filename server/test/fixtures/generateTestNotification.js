const Notification = require("../../models/Notification");
const User = require("../../models/User");

let myNotification = null;

module.exports.generateTestNotification = async (user, text="test notification") => {
  if(!user.active){
    throw Error("The notified user provided is not active")
  }

  const notification = await Notification.create({
    user: user,
    text: text
  });

  await notification.populate({ path: 'user', model: User });

  myNotification = notification;
  return notification;
}

module.exports.getTestNotificationId = async () => {
  if (myNotification) {
    return myNotification._id;
  } else {
    throw Error("Notification not generated")
  }
}