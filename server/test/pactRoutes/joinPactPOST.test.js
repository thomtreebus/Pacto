const supertest = require("supertest");
const app = require("../../app");
const { createToken } = require("../../controllers/auth");
const { generateTestUser, getDefaultTestUserEmail, generateCustomUniTestUser} = require("../fixtures/generateTestUser");
const { generateTestPact, getTestPactId } = require("../fixtures/generateTestPact");
const { MESSAGES, PACT_MESSAGES } = require("../../helpers/messages");
const User = require("../../models/User");
const Pact = require('../../models/Pact');
const useTestDatabase = require("../helpers/useTestDatabase");

describe("POST /pact/:pactid/join", () => {
  useTestDatabase();

  beforeEach(async () => {
    const user = await generateTestUser();
    user.active = true;
    await user.save();
    // Makes user a member and mod of pact
    const pact = await generateTestPact(user);
    await pact.save();
  });

  it("should not allow not logged in user to join the pact", async () => {
    const pact = await Pact.findOne({ _id: getTestPactId() });

    const response = await supertest(app)
    .post(`/pact/${pact._id}/join`)
    .expect(401);

    const {message, errors} = response.body;

    expect(message).toBe(null);
    expect(errors[0].field).toBe(null);
    expect(errors[0].message).toBe(MESSAGES.AUTH.IS_NOT_LOGGED_IN);
    expect(errors.length).toBe(1);
  });

  it("user cannot join the pact of another university", async () => {
    const pact = await Pact.findOne({ _id: getTestPactId() });

    // Creating the user who is not in the correct uni
    const user = await generateCustomUniTestUser("User", "ucl");
    user.active = true;
    await user.save();
    const token = createToken(user._id);

    expect(user.pacts.includes(pact._id)).toBe(false);
    expect(pact.members.includes(user._id)).toBe(false);
    expect(pact.members.length).toBe(1);  
    expect(user.pacts.length).toBe(0);  

    const response = await supertest(app)
    .post(`/pact/${pact._id}/join`)
    .set("Cookie", [`jwt=${ token }`])
    .expect(404);

    const {message, errors} = response.body;

    expect(message).toBe(null);
    expect(errors[0].field).toBe(null);
    expect(errors[0].message).toBe(PACT_MESSAGES.NOT_FOUND);
    expect(errors.length).toBe(1);
    
    const updatedUser = await User.findOne({_id : user._id});
    const updatedPact = await Pact.findOne({ _id: getTestPactId() });
    expect(updatedUser.pacts.includes(pact._id)).toBe(false);
    expect(updatedPact.members.includes(user._id)).toBe(false);
    expect(updatedPact.members.length).toBe(1);
    expect(updatedUser.pacts.length).toBe(0);
  });

  it("should not change the amount of members if a joined user rejoins", async () => {
    const user = await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    const pact = await Pact.findOne({ _id: getTestPactId() });
    const token = createToken(user._id);

    expect(user.pacts.includes(pact._id)).toBe(true);
    expect(pact.members.includes(user._id)).toBe(true);
    expect(pact.members.length).toBe(1);  
    expect(user.pacts.length).toBe(1);  

    const response = await supertest(app)
    .post(`/pact/${pact._id}/join`)
    .set("Cookie", [`jwt=${ token }`])
    .expect(200);

    const {message, errors} = response.body;

    expect(message).toBeDefined();
    expect(errors.length).toBe(0);
    expect(message).toBe(PACT_MESSAGES.SUCCESSFUL_JOIN);

    const updatedUser = await User.findOne({ _id : user._id})
    const updatedPact = await Pact.findOne({ _id: getTestPactId() });
    expect(updatedUser.pacts.includes(pact._id)).toBe(true);
    expect(updatedPact.members.includes(user._id)).toBe(true);
    expect(updatedPact.members.length).toBe(1);
    expect(updatedUser.pacts.length).toBe(1);  
  });

  it("should not allow the joining of a non existing pact", async () => {
    const user = await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    const pact = await Pact.findOne({ _id: getTestPactId() });
    const token = createToken(user._id);

    const response = await supertest(app)
    .post(`/pact/${pact._id + 1}/join`)
    .set("Cookie", [`jwt=${ token }`])
    .expect(404);

    const {message, errors} = response.body;

    expect(message).toBeDefined();
    expect(message).toBe(null);
    expect(errors[0].field).toBe(null);
    expect(errors[0].message).toBe(PACT_MESSAGES.NOT_FOUND);
    expect(errors.length).toBe(1);
  });

  
  it("should not allow a banned user to join a pact", async () => {
    const user = await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    const pact = await Pact.findOne({ _id: getTestPactId() });
    pact.bannedUsers.push(user);
    await pact.save();
    const token = createToken(user._id);

    const response = await supertest(app)
    .post(`/pact/${pact._id}/join`)
    .set("Cookie", [`jwt=${ token }`])
    .expect(404);

    const {message, errors} = response.body;

    expect(message).toBeDefined();
    expect(message).toBe(null);
    expect(errors[0].field).toBe(null);
    expect(errors[0].message).toBe(PACT_MESSAGES.IS_BANNED_USER);
    expect(errors.length).toBe(1);
  });

  it("allows the user to successfully join a pact", async () => {
    const pact = await Pact.findOne({ _id: getTestPactId() });
    const user = await generateTestUser("User");
    user.active = true;
    await user.save();
    const token = createToken(user._id);

    expect(user.pacts.includes(pact._id)).toBe(false);
    expect(pact.members.includes(user._id)).toBe(false);
    expect(pact.members.length).toBe(1);  
    expect(user.pacts.length).toBe(0);  

    const response = await supertest(app)
    .post(`/pact/${pact._id}/join`)
    .set("Cookie", [`jwt=${ token }`])
    .expect(200);

    const {message, errors} = response.body;

    expect(message).toBeDefined();
    expect(errors.length).toBe(0);
    expect(message).toBe(PACT_MESSAGES.SUCCESSFUL_JOIN);

    const updatedUser = await User.findOne({ _id : user._id})
    const updatedPact = await Pact.findOne({ _id: getTestPactId() });
    expect(updatedUser.pacts.includes(pact._id)).toBe(true);
    expect(updatedPact.members.includes(user._id)).toBe(true);
    expect(updatedPact.members.length).toBe(2);
    expect(updatedUser.pacts.length).toBe(1);  
  });

  it("allows the user to successfully join multiple pacts", async () => {
    const foundingUser = await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    const pact = await Pact.findOne({ _id: getTestPactId() });
    const secondPact = await generateTestPact(foundingUser, "Second pact");
    const user = await generateTestUser("User");
    user.active = true;
    await user.save();
    const token = createToken(user._id);

    expect(user.pacts.includes(pact._id)).toBe(false);
    expect(user.pacts.includes(secondPact._id)).toBe(false);
    expect(pact.members.includes(user._id)).toBe(false);
    expect(secondPact.members.includes(user._id)).toBe(false);
    expect(pact.members.length).toBe(1);  
    expect(secondPact.members.length).toBe(1);  
    expect(user.pacts.length).toBe(0);  

    const response = await supertest(app)
    .post(`/pact/${pact._id}/join`)
    .set("Cookie", [`jwt=${ token }`])
    .expect(200);

    let {message, errors} = response.body;

    expect(message).toBeDefined();
    expect(errors.length).toBe(0);
    expect(message).toBe(PACT_MESSAGES.SUCCESSFUL_JOIN);

    let updatedUser = await User.findOne({ _id : user._id})
    let updatedPact = await Pact.findOne({ _id: pact._id });
    let updatedSecondPact = await Pact.findOne({ _id: secondPact._id });

    expect(updatedUser.pacts.includes(pact._id)).toBe(true);
    expect(updatedUser.pacts.includes(updatedSecondPact._id)).toBe(false);
    expect(updatedPact.members.includes(updatedUser._id)).toBe(true);
    expect(updatedSecondPact.members.includes(updatedUser._id)).toBe(false);
    expect(updatedPact.members.length).toBe(2);  
    expect(updatedSecondPact.members.length).toBe(1);  
    expect(updatedUser.pacts.length).toBe(1);  
  
    const secondResponse = await supertest(app)
    .post(`/pact/${secondPact._id}/join`)
    .set("Cookie", [`jwt=${ token }`])
    .expect(200);

    message = secondResponse.body.message;
    errors = secondResponse.body.errors;

    expect(message).toBeDefined();
    expect(errors.length).toBe(0);

    updatedUser = await User.findOne({ _id : user._id})
    updatedPact = await Pact.findOne({ _id: pact._id });
    updatedSecondPact = await Pact.findOne({ _id: secondPact._id });

    expect(updatedUser.pacts.includes(pact._id)).toBe(true);
    expect(updatedUser.pacts.includes(updatedSecondPact._id)).toBe(true);
    expect(updatedPact.members.includes(updatedUser._id)).toBe(true);
    expect(updatedSecondPact.members.includes(updatedUser._id)).toBe(true);
    expect(updatedPact.members.length).toBe(2);  
    expect(updatedSecondPact.members.length).toBe(2);  
    expect(updatedUser.pacts.length).toBe(2);  
  });  
});