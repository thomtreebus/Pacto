const Pact = require("../../models/Pact");
const User = require("../../models/User");
const Post = require("../../models/Post");
const University = require("../../models/University");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const supertest = require("supertest");
const app = require("../../app");
const { generateTestUser, getDefaultTestUserEmail } = require("../fixtures/generateTestUser");
const { generateTestPact, getTestPactId } = require("../fixtures/generateTestPact");
const { generateTestPost, getTestPostId } = require("../fixtures/generateTestPost");
const { createToken } = require("../../controllers/auth");
const { PACT_MESSAGES, MESSAGES } = require("../../helpers/messages");

describe("search /search/:query", () => {
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

    const pact = await generateTestPact(user);
    await pact.save();

    const post = await generateTestPost(user, pact);
    await post.save();

  });

	afterEach(async () => {
		await User.deleteMany({});
    await Pact.deleteMany({});
    await Post.deleteMany({});
		await University.deleteMany({});
	});

  // Tests
  it("get search with query", async () => {
    const query = "test";
    const user = await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    const pact = await Pact.findOne({ id: getTestPactId() });
    const post = await Post.findOne({ id: getTestPostId() });
    const token = createToken(user._id);

    const response = await supertest(app)
    .get(`/search/${query}`)
    .set("Cookie", [`jwt=${token}`])
    .expect(200);
    expect(response.body.message).toBeDefined();
    expect(response.body.errors.length).toBe(0);
    expect(response.body.message.pacts).toBeDefined();
    expect(response.body.message.users).toBeDefined();
    expect(response.body.message.posts).toBeDefined();
  });

  it("returns pacts with names that match query", async () => {
    const query = "My pact";
    const user = await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    const token = createToken(user._id);

    const response = await supertest(app)
    .get(`/search/${query}`)
    .set("Cookie", [`jwt=${token}`])
    .expect(200);
    expect(response.body.message).toBeDefined();
    expect(response.body.errors.length).toBe(0);
    expect(response.body.message.pacts).toBeDefined();
    expect(response.body.message.users).toBeDefined();
    expect(response.body.message.posts).toBeDefined();
    expect(response.body.message.pacts[0]._id).toBe(getTestPactId().toString());
  });

  it("returns users with names that match query", async () => {
    const query = "Dummy title";
    const user = await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    const post = await Post.findOne({ id: getTestPostId() });
    const token = createToken(user._id);

    const response = await supertest(app)
    .get(`/search/${query}`)
    .set("Cookie", [`jwt=${token}`])
    .expect(200);
    expect(response.body.message).toBeDefined();
    expect(response.body.errors.length).toBe(0);
    expect(response.body.message.pacts).toBeDefined();
    expect(response.body.message.users).toBeDefined();
    expect(response.body.message.posts).toBeDefined();
    expect(response.body.message.posts.length).toBe(1);
    expect(response.body.message.posts[0]._id).toBe(post._id.toString());
  });

  it("returns posts with names that match query", async () => {
    const query = "Dummy title";
    const user = await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    const token = createToken(user._id);
    const response = await supertest(app)
    .get(`/search/${query}`)
    .set("Cookie", [`jwt=${token}`])
    .expect(200);
    expect(response.body.message).toBeDefined();
    expect(response.body.errors.length).toBe(0);
    expect(response.body.message.pacts).toBeDefined();
    expect(response.body.message.users).toBeDefined();
    expect(response.body.message.posts).toBeDefined();
    expect(response.body.message.posts.length).toBe(1);
    });

  it("does not return posts from a pact the user is not a member of", async () => {
    const query = "bob's post";
    const user = await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    const bob = await generateTestUser("bob");
    bob.active = true;
    await bob.save();
    const pactUserIsNotIn = await generateTestPact(bob, "bob's pact");
    const post = await generateTestPost(user, pactUserIsNotIn, "bob's post");
    await post.save();
    await pactUserIsNotIn.save();
    await bob.save();
    const token = createToken(user._id);

    const response = await supertest(app)
    .get(`/search/${query}`)
    .set("Cookie", [`jwt=${token}`])
    .expect(200);
    expect(response.body.message).toBeDefined();
    expect(response.body.errors.length).toBe(0);
    expect(response.body.message.pacts).toBeDefined();
    expect(response.body.message.users).toBeDefined();
    expect(response.body.message.posts).toBeDefined();
    expect(response.body.message.posts.length).toBe(0);
  });
  
  it("uses checkAuthenticated middleware", async () =>{

    const response = await supertest(app)
      .get(`/search/test`)
      .expect(401);

    expect(response.body.message).toBe(null);
    expect(response.body.errors[0].field).toBe(null);
    expect(response.body.errors[0].message).toBe(MESSAGES.AUTH.IS_NOT_LOGGED_IN);
    expect(response.body.errors.length).toBe(1);
  });  
});