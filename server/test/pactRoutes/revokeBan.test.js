const supertest = require("supertest");
const app = require("../../app");
const { createToken } = require("../../controllers/authController");
const { generateTestUser, getDefaultTestUserEmail} = require("../fixtures/generateTestUser");
const { generateTestPact, getTestPactId } = require("../fixtures/generateTestPact");
const { MESSAGES, PACT_MESSAGES } = require("../../helpers/messages");
const User = require("../../models/User");
const Pact = require('../../models/Pact');
const useTestDatabase = require("../helpers/useTestDatabase");

describe("POST /post/upvote/:pactid/:id", () => {
  useTestDatabase("revokeBan");

  beforeEach(async () => {
    const user = await generateTestUser();
    user.active = true;
    await user.save();
    // Makes user a member and mod of pact
    const pact = await generateTestPact(user);
    //Make other user a member of pact
    const secondUser = await generateTestUser("bob");
    secondUser.active = true;
    pact.bannedUsers.push(secondUser._id);
    await secondUser.save();
    await pact.save();
  });

  it("moderator can revoke ban of banned user", async () => {
    const user = await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    const pact = await Pact.findOne({ _id: getTestPactId() });
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

    const responsePact = await Pact.findOne({ _id: getTestPactId() });
    const newBanCount = responsePact.bannedUsers.length;
    expect(newBanCount).toBe(oldBanCount - 1);

    const responseUser = await User.findOne({ uniEmail: "bob.to@kcl.ac.uk" });
    const newPactCount = responseUser.pacts.length;
    expect(newPactCount).toBe(oldPactCount + 1);
  });

  it("moderator can not revoke ban of user that is not banned", async () => {
    const user = await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    const pact = await Pact.findOne({ _id: getTestPactId() });
    const notBannedUser = await generateTestUser("joe");
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
    const user = await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    const otherUser = await generateTestUser("joe");
    otherUser.save();
    const pact = await Pact.findOne({ _id: getTestPactId() });
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
    const otherUser = await generateTestUser("joe");
    otherUser.save();
    const pact = await Pact.findOne({ _id: getTestPactId() });
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
    const pact = await Pact.findOne({ _id: getTestPactId() });

    const response = await supertest(app)
    .put(`/pact/${ pact._id }/${ user._id }/revokeban/`)
    .expect(401);
    expect(response.body.message).toBe(null);
    expect(response.body.errors[0].field).toBe(null);
    expect(response.body.errors[0].message).toBe(MESSAGES.AUTH.IS_NOT_LOGGED_IN);
    expect(response.body.errors.length).toBe(1);
  });

});