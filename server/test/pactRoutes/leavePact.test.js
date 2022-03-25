const Pact = require("../../models/Pact");
const User = require("../../models/User");
const University = require("../../models/University");
const supertest = require("supertest");
const app = require("../../app");
const { generateTestUser, getDefaultTestUserEmail } = require("../fixtures/generateTestUser");
const { createToken } = require("../../controllers/authController");
const { PACT_MESSAGES } = require("../../helpers/messages");
const {generateTestPact, getTestPactId} = require("../fixtures/generateTestPact");
const useTestDatabase = require("../helpers/useTestDatabase");

// Magic values
const NAME = "My pact";
const DESCRIPTION = "This is my 1st pact."
const CATEGORY = "course";

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
    await pact.update();
    await moderator.update();
  }

  // Tests
  it("lets members leave a pact", async () =>{
    const founder =  await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    const user = await generateTestUser("user", "ucl");
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
    expect(response.body.errors.length).toBe(0);

    const updatedPact2 = await Pact.findById(pactId);
    expect(updatedPact2.members.length).toBe(1);
    expect(updatedPact2.members[0]._id.toString()).toBe(founder._id.toString());
    expect(updatedPact2.moderators.length).toBe(1);
    expect(updatedPact2.moderators[0]._id.toString()).toBe(founder._id.toString());

    const updatedUser2 = await User.findById(user._id);
    expect(updatedUser2.pacts.length).toBe(0);
  });  

});