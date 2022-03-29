const dotenv = require("dotenv");
const supertest = require("supertest");
const app = require("../../app");
const { createToken } = require("../../controllers/authController");
const { generateTestUser, getDefaultTestUserEmail } = require("../fixtures/generateTestUser");
const { generateTestNotification, getTestNotificationId } = require("../fixtures/generateTestNotification");
const { MESSAGES } = require("../../helpers/messages");
const User = require("../../models/User");
const Notification = require('../../models/Notification');
const useTestDatabase = require("../helpers/useTestDatabase");

dotenv.config();

describe("GET /notifications getNotifications()", () => {

  useTestDatabase("notificationsGET");

  beforeEach(async () => {
    const user = await generateTestUser();
    user.active = true;
    await user.save();
    // Make a notification for the user
    const notification = await generateTestNotification(user);
    await notification.save();
  });

  it("user can get its notifications", async () => {
    const user = await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    const notification = await Notification.findOne({ id: getTestNotificationId() });
    const token = createToken(user._id);

    const response = await supertest(app)
    .get("/notifications")
    .set("Cookie", [`jwt=${token}`])
    .expect(200);
    expect(response.body.message).toBeDefined();
    expect(response.body.errors.length).toBe(0);

    const responseNotifications = response.body.message;
    expect(responseNotifications).toBeDefined();
    expect(responseNotifications.length).toBe(1);
    expect(responseNotifications[0].user._id).toBe(notification.user._id.toString());
    expect(responseNotifications[0].text).toBe("test notification");
  });

  it("check uses authMiddleware", async () => {
    const response = await supertest(app)
    .get(`/notifications`)
    .expect(401);
    expect(response.body.message).toBe(null);
    expect(response.body.errors[0].field).toBe(null);
    expect(response.body.errors[0].message).toBe(MESSAGES.AUTH.IS_NOT_LOGGED_IN);
    expect(response.body.errors.length).toBe(1);
  });
});