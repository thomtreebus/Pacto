const dotenv = require("dotenv");
const supertest = require("supertest");
const app = require("../../app");
const { createToken } = require("../../controllers/authController");
const { generateTestUser, getDefaultTestUserEmail } = require("../fixtures/generateTestUser");
const { generateTestNotification, getTestNotificationId } = require("../fixtures/generateTestNotification");
const { MESSAGES, NOTIFICATION_MESSAGES } = require("../../helpers/messages");
const User = require("../../models/User");
const Notification = require('../../models/Notification');
const useTestDatabase = require("../helpers/useTestDatabase");

dotenv.config();

describe("GET /notifications getNotifications()", () => {

  useTestDatabase("markAsReadGET");

  beforeEach(async () => {
    const user = await generateTestUser();
    user.active = true;
    await user.save();
    // Make a notification for the user
    const notification = await generateTestNotification(user);
    await notification.save();
  });

  it("user can mark notification as read", async () => {
    const user = await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    const notification = await Notification.findOne({ id: getTestNotificationId() });
    const token = createToken(user._id);
    const response = await supertest(app)
    .put(`/notifications/${ notification._id }/update`)
    .set("Cookie", [`jwt=${token}`])
    .expect(200);
    expect(response.body.message).toBeDefined();
    expect(response.body.errors.length).toBe(0);

    const responseNotification = response.body.message;
    expect(responseNotification).toBeDefined();
    expect(responseNotification._id).toBe(notification._id.toString());
    expect(responseNotification.read).toBe(true);
  });

  it("user can not mark notification that is already read as read", async () => {
    const user = await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    const notification = await Notification.findOne({ id: getTestNotificationId() });
    notification.read = true;
    notification.save();
    const token = createToken(user._id);

    const response = await supertest(app)
    .put(`/notifications/${ notification._id }/update`)
    .set("Cookie", [`jwt=${token}`])
    .expect(400);
    expect(response.body.message).toBeDefined();
    expect(response.body.errors.length).toBe(1);
    expect(response.body.errors[0].field).toBe(null);
    expect(response.body.errors[0].message).toBe(NOTIFICATION_MESSAGES.ALREADY_READ);
  });

  it("error when notification does not exist", async () => {
    const user = await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    const invalidNotificationId = 3;
    // const notification = await Notification.findOne({ id: getTestNotificationId() });
    const token = createToken(user._id);

    const response = await supertest(app)
    .put(`/notifications/${ user._id }/update`)
    .set("Cookie", [`jwt=${token}`])
    .expect(404);
    expect(response.body.message).toBeDefined();
    expect(response.body.errors.length).toBe(1);
    expect(response.body.errors[0].field).toBe(null);
    expect(response.body.errors[0].message).toBe(NOTIFICATION_MESSAGES.NOT_FOUND);
  });

  it("can not mark notification as read for other user", async () => {
    const user = await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    const otherUser = await generateTestUser("bob");
    otherUser.active = true;
    otherUser.save()
    const notification = await Notification.findOne({ id: getTestNotificationId() });
    const token = createToken(otherUser._id);

    const response = await supertest(app)
    .put(`/notifications/${ notification._id }/update`)
    .set("Cookie", [`jwt=${token}`])
    .expect(400);
    expect(response.body.message).toBeDefined();
    expect(response.body.errors.length).toBe(1);
    expect(response.body.errors[0].field).toBe(null);
    expect(response.body.errors[0].message).toBe(NOTIFICATION_MESSAGES.OTHER_USER);
  });

  it("check uses authMiddleware", async () => {
    const notification = await Notification.findOne({ id: getTestNotificationId() });
    const response = await supertest(app)
    .put(`/notifications/${notification._id}/update`)
    .expect(401);
    expect(response.body.message).toBe(null);
    expect(response.body.errors[0].field).toBe(null);
    expect(response.body.errors[0].message).toBe(MESSAGES.AUTH.IS_NOT_LOGGED_IN);
    expect(response.body.errors.length).toBe(1);
  });
});