const mongoose = require("mongoose");
const dotenv = require("dotenv");
const supertest = require("supertest");
const bcrypt = require("bcrypt");
const app = require("../../app");
const { createToken } = require("../../controllers/authController");
const { generateTestUser, getTestUserEmail, generateNextTestUser } = require("../fixtures/generateTestUser");
const { generateTestPact, getTestPactId } = require("../fixtures/generateTestPact");
const { generateTestPost, getTestPostId } = require("../fixtures/generateTestPost");
const { jsonResponse } = require("../../helpers/responseHandlers");
const { MESSAGES, PACT_MESSAGES } = require("../../helpers/messages");
const University = require('../../models/University');
const User = require("../../models/User");
const Pact = require('../../models/Pact');
const Notification = require('../../models/Notification');

dotenv.config();

describe("POST /post/upvote/:pactid/:id", () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.TEST_DB_CONNECTION_URL);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    const user = await generateTestUser();
    user.active = true;
    await user.save();
    // Makes user a member and mod of pact
    const pact = await generateTestPact(user);
    //Make other user a member of pact
    const secondUser = await generateNextTestUser("bob");
    secondUser.active = true;
    pact.bannedUsers.push(secondUser._id);
    await secondUser.save();
    await pact.save();
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Pact.deleteMany({});
    await University.deleteMany({});
    await Notification.deleteMany({});
  });

  it("moderator can revoke ban of banned user", async () => {
    const user = await User.findOne({ uniEmail: getTestUserEmail() });
    const pact = await Pact.findOne({ id: getTestPactId() });
    const revokeBanUser = await User.findOne({ uniEmail: "bob.to@kcl.ac.uk" });
    const token = createToken(user._id);
    const oldBanCount = pact.bannedUsers.length;
    const oldPactCount = revokeBanUser.pacts.length;

    const response = await supertest(app)
    .put(`/pact/${ pact._id }/${ revokeBanUser._id }/revokeban/`)
    .set("Cookie", [`jwt=${token}`])
    .expect(200);
    expect(response.body.message).toBeDefined();
    expect(response.body.errors.length).toBe(0);

    const responsePact = await Pact.findOne({ id: getTestPactId() });
    const newBanCount = responsePact.bannedUsers.length;
    expect(newBanCount).toBe(oldBanCount - 1);

    const responseUser = await User.findOne({ uniEmail: "bob.to@kcl.ac.uk" });
    const newPactCount = responseUser.pacts.length;
    expect(newPactCount).toBe(oldPactCount + 1);
  });

  it("user gets notification that they are no longer banned", async () => {
    const user = await User.findOne({ uniEmail: getTestUserEmail() });
    const pact = await Pact.findOne({ id: getTestPactId() });
    const revokeBanUser = await User.findOne({ uniEmail: "bob.to@kcl.ac.uk" });
    const token = createToken(user._id);
    const oldBanCount = pact.bannedUsers.length;
    const oldPactCount = revokeBanUser.pacts.length;

    const response = await supertest(app)
    .put(`/pact/${ pact._id }/${ revokeBanUser._id }/revokeban/`)
    .set("Cookie", [`jwt=${token}`])
    .expect(200);
    expect(response.body.message).toBeDefined();
    expect(response.body.errors.length).toBe(0);

    const responsePact = await Pact.findOne({ id: getTestPactId() });
    const newBanCount = responsePact.bannedUsers.length;
    expect(newBanCount).toBe(oldBanCount - 1);

    const responseUser = await User.findOne({ uniEmail: "bob.to@kcl.ac.uk" });
    const newPactCount = responseUser.pacts.length;
    expect(newPactCount).toBe(oldPactCount + 1);

    const notification = await Notification.findOne({ user: revokeBanUser._id });
    expect(notification).toBeDefined();
    expect(notification.user._id.toString()).toBe(revokeBanUser._id.toString());
    expect(notification.text).toBe(`You are no longer banned from ${pact.name}`);
  });

  it("moderator can not revoke ban of user that is not banned", async () => {
    const user = await User.findOne({ uniEmail: getTestUserEmail() });
    const pact = await Pact.findOne({ id: getTestPactId() });
    const notBannedUser = await generateNextTestUser("joe");
    pact.members.push(notBannedUser._id);
    pact.save();
    notBannedUser.pacts.push(pact._id);
    notBannedUser.save();

    const token = createToken(user._id);
    const response = await supertest(app)
    .put(`/pact/${ pact._id }/${ notBannedUser._id }/revokeban/`)
    .set("Cookie", [`jwt=${token}`])
    .expect(404);
    expect(response.body.message).toBe(null);
    expect(response.body.errors.length).toBe(1);
    expect(response.body.errors[0].field).toBe(null);
    expect(response.body.errors[0].message).toBe(PACT_MESSAGES.NOT_BANNED);
  });

  it("can not revoke ban of someone who is not a member", async () => {
    const user = await User.findOne({ uniEmail: getTestUserEmail() });
    const otherUser = await generateNextTestUser("joe");
    otherUser.save();
    const pact = await Pact.findOne({ id: getTestPactId() });
    const token = createToken(user._id);

    const response = await supertest(app)
    .put(`/pact/${ pact._id }/${ otherUser._id }/revokeban/`)
    .set("Cookie", [`jwt=${token}`])
    .expect(404);
    expect(response.body.message).toBe(null);
    expect(response.body.errors.length).toBe(1);
    expect(response.body.errors[0].field).toBe(null);
    expect(response.body.errors[0].message).toBe(PACT_MESSAGES.NOT_BANNED);
  });

  it("member can not revoke a ban", async () => {
    const user = await User.findOne({ uniEmail: "bob.to@kcl.ac.uk" });
    const otherUser = await generateNextTestUser("joe");
    otherUser.save();
    const pact = await Pact.findOne({ id: getTestPactId() });
    pact.members.push(otherUser._id);
    pact.members.push(user._id);
    pact.save();
    const token = createToken(user._id);

    const response = await supertest(app)
    .put(`/pact/${ pact._id }/${ otherUser._id }/revokeban/`)
    .set("Cookie", [`jwt=${token}`])
    .expect(401);
    expect(response.body.message).toBe(null);
    expect(response.body.errors.length).toBe(1);
    expect(response.body.errors[0].field).toBe(null);
    expect(response.body.errors[0].message).toBe(PACT_MESSAGES.NOT_MODERATOR);
  });

  it("check uses authMiddleware", async () => {
    const user = await User.findOne({ uniEmail: "bob.to@kcl.ac.uk" });
    const pact = await Pact.findOne({ id: getTestPactId() });

    const response = await supertest(app)
    .put(`/pact/${ pact._id }/${ user._id }/revokeban/`)
    .expect(401);
    expect(response.body.message).toBe(null);
    expect(response.body.errors[0].field).toBe(null);
    expect(response.body.errors[0].message).toBe(MESSAGES.AUTH.IS_NOT_LOGGED_IN);
    expect(response.body.errors.length).toBe(1);
  });

});