const Pact = require("../../models/Pact");
const User = require("../../models/User");
const supertest = require("supertest");
const app = require("../../app");
const { generateTestUser, getDefaultTestUserEmail } = require("../fixtures/generateTestUser");
const { createToken } = require("../../controllers/authController");
const { MESSAGES, PACT_MESSAGES } = require("../../helpers/messages");
const {generateTestPact, getTestPactId} = require("../fixtures/generateTestPact");
const useTestDatabase = require("../helpers/useTestDatabase");

describe("DELETE /pact/:pact_id/leave", () => {
  useTestDatabase("leavePact");

  beforeEach(async () => {
    const user = await generateTestUser();
    user.active = true;
    await user.save();

    await generateTestPact(user);
  });

  // Helpers
  const addMember = async (pact, member) => {
    await pact.members.push(member);
    await member.pacts.push(pact);
    await pact.save();
    await member.save();
  }

  const addModerator = async (pact, moderator) => {
    await pact.members.push(moderator);
    await pact.moderators.push(moderator);
    await moderator.pacts.push(pact);
    await pact.save();
    await moderator.save();
  }

  // Tests
  it("lets members leave a pact", async () =>{
    const founder =  await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    const user = await generateTestUser("user", "kcl");
    user.active = true;
    await user.save();

    const pactId = getTestPactId();
    const pact = await Pact.findById(pactId);
    await addMember(pact, user);

    const updatedPact = await Pact.findById(pactId);
    expect(updatedPact.members.length).toBe(2);
    expect(updatedPact.members[0]._id.toString()).toBe(founder._id.toString());
    expect(updatedPact.members[1]._id.toString()).toBe(user._id.toString());
    expect(updatedPact.moderators.length).toBe(1);
    expect(updatedPact.moderators[0]._id.toString()).toBe(founder._id.toString());
    
    const updatedUser = await User.findById(user._id);
    expect(updatedUser.pacts.length).toBe(1);
    expect(updatedUser.pacts[0]._id.toString()).toBe(pactId.toString());
    const token = createToken(updatedUser._id);

    const response = await supertest(app)
    .delete(`/pact/${ pactId }/leave`)
    .set("Cookie", [`jwt=${token}`])
    .expect(201);
    expect(response.body.message).toBeDefined();
    expect(response.body.message).toBe(PACT_MESSAGES.LEAVE.SUCCESSFUL);
    expect(response.body.errors.length).toBe(0);

    const updatedPact2 = await Pact.findById(pactId);
    expect(updatedPact2.members.length).toBe(1);
    expect(updatedPact2.members[0]._id.toString()).toBe(founder._id.toString());
    expect(updatedPact2.moderators.length).toBe(1);
    expect(updatedPact2.moderators[0]._id.toString()).toBe(founder._id.toString());

    const updatedUser2 = await User.findById(user._id);
    expect(updatedUser2.pacts.length).toBe(0);
  });  

  it("fails if you are alone in the pact", async () =>{
    const user =  await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    const pact = await Pact.findById(getTestPactId());
    expect(pact.members.length).toBe(1);
    expect(pact.members[0]._id.toString()).toBe(user._id.toString());
    expect(pact.moderators.length).toBe(1);
    expect(pact.moderators[0]._id.toString()).toBe(user._id.toString());

    const token = createToken(user._id);
    const response = await supertest(app)
    .delete(`/pact/${ pact._id }/leave`)
    .set("Cookie", [`jwt=${token}`])
    .expect(404);
    expect(response.body.message).toBeDefined();
    expect(response.body.errors.length).toBe(1);
    expect(response.body.errors[0].field).toBe(null);
    expect(response.body.errors[0].message).toBe(PACT_MESSAGES.LEAVE.ALONE);

    const updatedPact = await Pact.findById(getTestPactId());
    expect(updatedPact.members.length).toBe(1);
    expect(updatedPact.members[0]._id.toString()).toBe(user._id.toString());
    expect(updatedPact.moderators.length).toBe(1);
    expect(updatedPact.moderators[0]._id.toString()).toBe(user._id.toString());
  }); 

  it("fails if you are the only moderator (but not alone in the pact)", async () =>{
    const founder =  await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    const user1 = await generateTestUser("userOne", "kcl");
    const user2 = await generateTestUser("userTwo", "kcl");
    const user3 = await generateTestUser("userThree", "kcl");
    const pactId = getTestPactId();
    const pact = await Pact.findById(pactId);
    await addMember(pact, user1);
    await addMember(pact, user2);
    await addMember(pact, user3);

    const updatedPact = await Pact.findById(pactId);
    expect(updatedPact.members.length).toBe(4);
    expect(updatedPact.moderators.length).toBe(1);
    expect(updatedPact.moderators[0]._id.toString()).toBe(founder._id.toString());

    const token = createToken(founder._id);
    const response = await supertest(app)
    .delete(`/pact/${ pact._id }/leave`)
    .set("Cookie", [`jwt=${token}`])
    .expect(404);
    expect(response.body.message).toBeDefined();
    expect(response.body.errors.length).toBe(1);
    expect(response.body.errors[0].field).toBe(null);
    expect(response.body.errors[0].message).toBe(PACT_MESSAGES.LEAVE.ONLY_MODERATOR);

    const updatedPact2 = await Pact.findById(getTestPactId());
    expect(updatedPact2.members.length).toBe(4);
    expect(updatedPact2.moderators.length).toBe(1);
    expect(updatedPact2.moderators[0]._id.toString()).toBe(founder._id.toString());
  }); 

  it("succeeds if you are one of multiple moderators", async () =>{
    const founder =  await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    const user1 = await generateTestUser("userOne", "kcl");
    const user2 = await generateTestUser("userTwo", "kcl");
    const user3 = await generateTestUser("userThree", "kcl");
    const mod2 = await generateTestUser("modTwo", "kcl");
    mod2.active = true;
    await mod2.save();
    const pactId = getTestPactId();
    const pact = await Pact.findById(pactId);
    await addMember(pact, user1);
    await addMember(pact, user2);
    await addMember(pact, user3);
    await addModerator(pact, mod2);

    const updatedPact = await Pact.findById(pactId);
    expect(updatedPact.members.length).toBe(5);
    expect(updatedPact.members.includes(founder._id)).toBe(true);
    expect(updatedPact.members.includes(mod2._id)).toBe(true);
    expect(updatedPact.moderators.length).toBe(2);
    expect(updatedPact.moderators[1]._id.toString()).toBe(mod2._id.toString());

    const updatedMod2 = await User.findById(mod2._id);
    expect(updatedMod2.pacts.length).toBe(1);
    expect(updatedMod2.pacts[0]._id.toString()).toBe(pactId.toString());

    const token = createToken(mod2._id);
    const response = await supertest(app)
    .delete(`/pact/${ pact._id }/leave`)
    .set("Cookie", [`jwt=${token}`])
    .expect(201);
    expect(response.body.message).toBeDefined();
    expect(response.body.errors.length).toBe(0);

    const updatedPact2 = await Pact.findById(getTestPactId());
    expect(updatedPact2.members.length).toBe(4);
    expect(updatedPact2.members.includes(founder._id)).toBe(true);
    expect(updatedPact2.members.includes(mod2._id)).toBe(false);
    expect(updatedPact2.moderators.length).toBe(1);
    expect(updatedPact2.moderators.includes(mod2._id)).toBe(false);

    const updatedAgainMod2 = await User.findById(mod2._id);
    expect(updatedAgainMod2.pacts.length).toBe(0);
  });

  it("uses checkAuthenticated middleware", async () =>{
    const token = "some gibberish";
    const pactId = await getTestPactId();

    const response = await supertest(app)
      .delete(`/pact/${ pactId }/leave`)
      .set("Cookie", [`jwt=${token}`])
      .expect(401);
    expect(response.body.message).toBeDefined();
    expect(response.body.errors.length).toBe(1);
    expect(response.body.errors[0].field).toBe(null);
    expect(response.body.errors[0].message).toBe(MESSAGES.AUTH.IS_NOT_LOGGED_IN);
  });

  it("uses checkIsMemberOfPact middleware", async () =>{
    const notMember = await generateTestUser("user", "kcl");
    notMember.active = true;
    await notMember.save();

    const pactId = getTestPactId();
    const token = createToken(notMember._id);
    const response = await supertest(app)
      .delete(`/pact/${ pactId }/leave`)
      .set("Cookie", [`jwt=${token}`])
      .expect(401);
    expect(response.body.message).toBeDefined();
    expect(response.body.errors.length).toBe(1);
    expect(response.body.errors[0].field).toBe(null);
    expect(response.body.errors[0].message).toBe(PACT_MESSAGES.NOT_AUTHORISED);
  });
});