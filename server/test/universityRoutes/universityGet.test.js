const Pact = require("../../models/Pact");
const User = require("../../models/User");
const Post = require("../../models/Post");
const supertest = require("supertest");
const app = require("../../app");
const { generateTestUser, getDefaultTestUserEmail } = require("../fixtures/generateTestUser");
const { generateTestPact, getTestPactId } = require("../fixtures/generateTestPact");
const { generateTestPost, getTestPostId } = require("../fixtures/generateTestPost");
const { createToken } = require("../../controllers/authController");
const { MESSAGES } = require("../../helpers/messages");
const useTestDatabase = require("../helpers/useTestDatabase");

describe("search /search/:query", () =>{
  useTestDatabase();

  beforeEach(async () => {
    const user = await generateTestUser();
    user.active = true;
    await user.save();

    const pact = await generateTestPact(user);
    await pact.save();

    const post = await generateTestPost(user, pact);
    await post.save();

  });

  // Tests
  it("gets the correct university", async () => {
    const user = await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    const userUni = user.university;
    const token = createToken(user._id);

    const response = await supertest(app)
    .get(`/university`)
    .set("Cookie", [`jwt=${token}`])
    .expect(200);
    expect(response.body.message).toBeDefined();
    expect(response.body.errors.length).toBe(0);
    expect(response.body.message._id).toBe(userUni.toString());
  });

  it("uses checkAuthenticated middleware", async () =>{

    const response = await supertest(app)
      .get(`/university`)
      .expect(401);

    expect(response.body.message).toBe(null);
    expect(response.body.errors[0].field).toBe(null);
    expect(response.body.errors[0].message).toBe(MESSAGES.AUTH.IS_NOT_LOGGED_IN);
    expect(response.body.errors.length).toBe(1);
  });  
});