const mongoose = require("mongoose");
const dotenv = require("dotenv");
const supertest = require("supertest");
const bcrypt = require("bcrypt");
const app = require("../../app");
const { createToken } = require("../../controllers/authController");
const { generateTestUser, getEmail, generateNextTestUser } = require("../fixtures/generateTestUser");
const { generateTestPact, getTestPactId } = require("../fixtures/generateTestPact");
const { generateTestPost, getTestPostId } = require("../fixtures/generateTestPost");
const { jsonResponse } = require("../../helpers/responseHandlers");
const { MESSAGES, PACT_MESSAGES } = require("../../helpers/messages");
const User = require("../../models/User");
const Pact = require('../../models/Pact');
const University = require('../../models/University');
const Post = require('../../models/Post');

dotenv.config();

describe("GET /pact/:pactId/post/:postId", () => {
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
    await pact.save();
    // User posts a post in the pact
    const post = await generateTestPost(user, pact);
    await post.save();
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Post.deleteMany({});
    await Pact.deleteMany({});
    await University.deleteMany({});
  });

  it("can get a post with valid pact id and user part of pact", async () => {
    const user = await User.findOne({ uniEmail: getEmail() });
    const pact = await Pact.findOne({ id: getTestPactId() });
    const post = await Post.findOne({ id: getTestPostId() });
    const token = createToken(user._id);

    const response = await supertest(app)
    .get(`/pact/${ pact._id }/post/${ post._id }`)
    .set("Cookie", [`jwt=${token}`])
    .expect(200);
    expect(response.body.message).toBeDefined();
    expect(response.body.errors.length).toBe(0);

    const responsePost = response.body.message;
    expect(responsePost.author).toBe(user._id.toString());
    expect(responsePost.title).toBe(post.title);
    expect(responsePost.text).toBe(post.text);
    expect(responsePost.type).toBe(post.type);
    expect(responsePost.link).toBe(post.link);
    expect(responsePost.votes).toBe(post.votes);
  });

  it("can get a post with valid pact id and another user part of pact", async () => {
    const user = await User.findOne({ uniEmail: getEmail() });
    const pact = await Pact.findOne({ id: getTestPactId() });
    const post = await Post.findOne({ id: getTestPostId() });

    // Creating 2nd user
    const user2 = await generateNextTestUser("SecondUser");
    user2.active = true;
    await user2.pacts.push(pact);
    await user2.save();
    await pact.members.push(user2);
    await pact.save();
    const token = createToken(user2._id);

    const response = await supertest(app)
    .get(`/pact/${ pact._id }/post/${ post._id }`)
    .set("Cookie", [`jwt=${token}`])
    .expect(200);
    expect(response.body.message).toBeDefined();
    expect(response.body.errors.length).toBe(0);

    const responsePost = response.body.message;
    expect(responsePost.author).toBe(user._id.toString());
    expect(responsePost.title).toBe(post.title);
    expect(responsePost.text).toBe(post.text);
    expect(responsePost.type).toBe(post.type);
    expect(responsePost.link).toBe(post.link);
    expect(responsePost.votes).toBe(post.votes);
  });

  it("user not in pact's uni cannot get a pact's post", async () => {
    // Creating the user who is not in the correct uni
    const user = await generateNextTestUser("User", notkcl=true, "ucl");
    user.active = true;
    await user.save();
    const token = createToken(user._id);

    const pact = await Pact.findOne({ id: getTestPactId() });
    const post = await Post.findOne({ id: getTestPostId() });

    const response = await supertest(app)
    .get(`/pact/${ pact._id }/post/${ post._id }`)
    .set("Cookie", [`jwt=${token}`])
    .expect(404);
    expect(response.body.message).toBe(null);
    expect(response.body.errors[0].field).toBe(null);
    expect(response.body.errors[0].message).toBe(PACT_MESSAGES.NOT_FOUND);
    expect(response.body.errors.length).toBe(1);
  });

  it("user in uni but not in pact cannot get post", async () => {
    // Creating the user who is not in the correct uni but not in the pact
    const user = await generateNextTestUser("User");
    user.active = true;
    await user.save();
    const token = createToken(user._id);

    const pact = await Pact.findOne({ id: getTestPactId() });
    const post = await Post.findOne({ id: getTestPostId() });

    const response = await supertest(app)
    .get(`/pact/${ pact._id }/post/${ post._id }`)
    .set("Cookie", [`jwt=${token}`])
    .expect(401);
    expect(response.body.message).toBe(null);
    expect(response.body.errors[0].field).toBe(null);
    expect(response.body.errors[0].message).toBe(PACT_MESSAGES.NOT_AUTHORISED);
    expect(response.body.errors.length).toBe(1);
  });

  it("cannot get post if not logged in", async () => {
    const pact = await Pact.findOne({ id: getTestPactId() });
    const post = await Post.findOne({ id: getTestPostId() });

    const response = await supertest(app)
    .get(`/pact/${ pact._id }/post/${ post._id }`)
    .expect(401);
    expect(response.body.message).toBe(null);
    expect(response.body.errors[0].field).toBe(null);
    expect(response.body.errors[0].message).toBe(MESSAGES.AUTH.IS_NOT_LOGGED_IN);
    expect(response.body.errors.length).toBe(1);
  });
});