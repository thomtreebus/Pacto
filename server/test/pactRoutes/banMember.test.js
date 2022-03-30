const supertest = require("supertest");
const app = require("../../app");
const { createToken } = require("../../controllers/authController");
const { generateTestUser, getDefaultTestUserEmail } = require("../fixtures/generateTestUser");
const { generateTestPact, getTestPactId } = require("../fixtures/generateTestPact");
const { MESSAGES, PACT_MESSAGES } = require("../../helpers/messages");
const User = require("../../models/User");
const Pact = require('../../models/Pact');
const Notification = require("../../models/Notification");
const useTestDatabase = require("../helpers/useTestDatabase");

describe("banMember /pact/:pactId/:userId/ban", () => {
  useTestDatabase();

  beforeEach(async () => {
    const user = await generateTestUser();
    user.active = true;
    await user.save();
    // Makes user a member and mod of pact
    const pact = await generateTestPact(user);
    //Make other user a member of pact
    const secondUser = await generateTestUser("bob");
    secondUser.active = true;
    secondUser.pacts.push(pact._id);
    pact.members.push(secondUser._id);
    await secondUser.save();
    await pact.save();
  });

  it("moderator can ban member of pact", async () => {
    const user = await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    const pact = await Pact.findOne({ _id: getTestPactId() });
    const banUser = await User.findOne({ uniEmail: "bob.to@kcl.ac.uk" });
    const token = createToken(user._id);
    const oldMemberCount = pact.members.length;
    const oldPactCount = banUser.pacts.length;
    const oldBannedUserCount = pact.bannedUsers.length;

    const response = await supertest(app)
    .put(`/pact/${ pact._id }/${ banUser._id }/ban/`)
    .set("Cookie", [`jwt=${token}`])
    .expect(200);
    expect(response.body.message).toBeDefined();
    expect(response.body.errors.length).toBe(0);

    const responsePact = await Pact.findOne({ _id: getTestPactId() });
    const newMemberCount = responsePact.members.length;
    const newBannedUserCount = responsePact.bannedUsers.length;
    expect(newMemberCount).toBe(oldMemberCount - 1);
    expect(newBannedUserCount).toBe(oldBannedUserCount + 1);

    const bannedUser = await User.findOne({ uniEmail: "bob.to@kcl.ac.uk" });
    const newPactCount = bannedUser.pacts.length;
    expect(newPactCount).toBe(oldPactCount - 1);
  });

  it("banned user gets notification when they get banned", async () => {
    const user = await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    const pact = await Pact.findOne({ id: getTestPactId() });
    const banUser = await User.findOne({ uniEmail: "bob.to@kcl.ac.uk" });
    const token = createToken(user._id);
    const oldMemberCount = pact.members.length;
    const oldPactCount = banUser.pacts.length;
    const oldBannedUserCount = pact.bannedUsers.length;

    const response = await supertest(app)
    .put(`/pact/${ pact._id }/${ banUser._id }/ban/`)
    .set("Cookie", [`jwt=${token}`])
    .expect(200);
    expect(response.body.message).toBeDefined();
    expect(response.body.errors.length).toBe(0);

    const responsePact = await Pact.findOne({ id: getTestPactId() });
    const newMemberCount = responsePact.members.length;
    const newBannedUserCount = responsePact.bannedUsers.length;
    expect(newMemberCount).toBe(oldMemberCount - 1);
    expect(newBannedUserCount).toBe(oldBannedUserCount + 1);

    const bannedUser = await User.findOne({ uniEmail: "bob.to@kcl.ac.uk" });
    const newPactCount = bannedUser.pacts.length;
    expect(newPactCount).toBe(oldPactCount - 1);

    const notification = await Notification.findOne({ user: banUser._id });
    expect(notification).toBeDefined();
    expect(notification.user._id.toString()).toBe(banUser._id.toString());
    expect(notification.text).toBe(`You have been banned from ${pact.name}`);
  });

  it("moderator can not ban other moderator", async () => {
    const user = await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    const pact = await Pact.findOne({ _id: getTestPactId() });
    const moderator = await User.findOne({ uniEmail: "bob.to@kcl.ac.uk" });
    pact.moderators.push(moderator._id);
    await pact.save();
    const token = createToken(user._id);

    const response = await supertest(app)
    .put(`/pact/${ pact._id }/${ moderator._id }/ban/`)
    .set("Cookie", [`jwt=${token}`])
    .expect(404);
    expect(response.body.message).toBe(null);
    expect(response.body.errors.length).toBe(1);
    expect(response.body.errors[0].field).toBe(null);
    expect(response.body.errors[0].message).toBe(PACT_MESSAGES.CANT_BAN_MODERATOR);
  });

  it("can not ban someone who is not a member", async () => {
    const user = await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    const otherUser = await generateTestUser("joe");
    otherUser.save();
    const pact = await Pact.findOne({ _id: getTestPactId() });
    const token = createToken(user._id);

    const response = await supertest(app)
    .put(`/pact/${ pact._id }/${ otherUser._id }/ban/`)
    .set("Cookie", [`jwt=${token}`])
    .expect(404);
    expect(response.body.message).toBe(null);
    expect(response.body.errors.length).toBe(1);
    expect(response.body.errors[0].field).toBe(null);
    expect(response.body.errors[0].message).toBe(PACT_MESSAGES.CANT_BAN_NON_MEMBER);
  });

    it("can not ban someone who is already banned", async () => {
    const user = await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    const pact = await Pact.findOne({ _id: getTestPactId() });
    const bannedUser = await User.findOne({ uniEmail: "bob.to@kcl.ac.uk" });
    pact.bannedUsers.push(bannedUser._id);
    pact.save();
    const token = createToken(user._id);
    
    const response = await supertest(app)
    .put(`/pact/${ pact._id }/${ bannedUser._id }/ban/`)
    .set("Cookie", [`jwt=${token}`])
    .expect(404);
    expect(response.body.message).toBe(null);
    expect(response.body.errors.length).toBe(1);
    expect(response.body.errors[0].field).toBe(null);
    expect(response.body.errors[0].message).toBe(PACT_MESSAGES.ALREADY_BANNED);
  });

  it("member can not ban other member", async () => {
    const user = await User.findOne({ uniEmail: "bob.to@kcl.ac.uk" });
    const otherUser = await generateTestUser("joe");
    otherUser.save();
    const pact = await Pact.findOne({ _id: getTestPactId() });
    pact.members.push(otherUser._id);
    pact.save();
    const token = createToken(user._id);

    const response = await supertest(app)
    .put(`/pact/${ pact._id }/${ otherUser._id }/ban/`)
    .set("Cookie", [`jwt=${token}`])
    .expect(401);
    expect(response.body.message).toBe(null);
    expect(response.body.errors.length).toBe(1);
    expect(response.body.errors[0].field).toBe(null);
    expect(response.body.errors[0].message).toBe(PACT_MESSAGES.NOT_MODERATOR);
  });

  it("check uses authMiddleware", async () => {
    const user = await User.findOne({ uniEmail: "bob.to@kcl.ac.uk" });
    const pact = await Pact.findOne({ _id: getTestPactId() });

    const response = await supertest(app)
    .put(`/pact/${ pact._id }/${ user._id }/ban/`)
    .expect(401);
    expect(response.body.message).toBe(null);
    expect(response.body.errors[0].field).toBe(null);
    expect(response.body.errors[0].message).toBe(MESSAGES.AUTH.IS_NOT_LOGGED_IN);
    expect(response.body.errors.length).toBe(1);
  });

});