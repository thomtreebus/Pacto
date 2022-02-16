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
const { MESSAGES } = require("../../helpers/messages");
const User = require("../../models/User");
const Pact = require('../../models/Pact')
const Post = require('../../models/Post')

dotenv.config();

describe("POST /post/downvote/:pactid/:id", () => {
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
  });

  it("downvote post with valid pact id and user part of pact", async () => {
    const user = await User.findOne({ uniEmail: getEmail() });
    const pact = await Pact.findOne({ id: getTestPactId() });
    const post = await Post.findOne({ id: getTestPostId() });
    const token = createToken(user._id);

    const oldVotes = post.votes;

    const response = await supertest(app)
    .post(`/pact/${ pact._id }/post/downvote/${ post._id }`)
    .set("Cookie", [`jwt=${ token }`])
    .expect(200);
    expect(response.body.message).toBeDefined();
    expect(response.body.errors.length).toBe(0);

    const responsePost = response.body.message;
    expect(responsePost.author).toBe(user._id.toString());
    expect(responsePost.votes).toBe(oldVotes - 1);
    expect(responsePost.upvoters).toStrictEqual([]);
    expect(responsePost.downvoters[0]._id).toBe(user._id.toString());
  });

  it("down twice does not change the votes count", async () => {
    const user = await User.findOne({ uniEmail: getEmail() });
    const pact = await Pact.findOne({ id: getTestPactId() });
    const post = await Post.findOne({ id: getTestPostId() });
    const token = createToken(user._id);

    const oldVotes = post.votes;

    let response;
    // downvote twice in a row
    for(let i = 0; i < 2; i++) {
      response = await supertest(app)
      .post(`/pact/${ pact._id }/post/downvote/${ post._id }`)
      .set("Cookie", [`jwt=${ token }`])
      .expect(200);
      expect(response.body.message).toBeDefined();
      expect(response.body.errors.length).toBe(0);
    }

    const responsePost = response.body.message;
    expect(responsePost.author).toBe(user._id.toString());
    expect(responsePost.votes).toBe(oldVotes);
    expect(responsePost.upvoters).toStrictEqual([]);
    expect(responsePost.downvoters).toStrictEqual([]);
  });

  it("two different users downvotes is cummulative", async () => {
    const user1 = await User.findOne({ uniEmail: getEmail() });
    const pact = await Pact.findOne({ id: getTestPactId() });
    const post = await Post.findOne({ id: getTestPostId() });
    const token1 = createToken(user1._id);

    // Creating 2nd user
    const user2 = await generateNextTestUser("SecondUser");
    user2.active = true;
    await user2.pacts.push(pact);
    await user2.save();
    await pact.members.push(user2);
    await pact.save();
    const token2 = createToken(user2._id);

    const oldVotes = post.votes;

    // 1st user downvote
    await supertest(app)
    .post(`/pact/${ pact._id }/post/downvote/${ post._id }`)
    .set("Cookie", [`jwt=${token1}`])
    .expect(200);

    // 2nd user downvote
    const response = await supertest(app)
    .post(`/pact/${ pact._id }/post/downvote/${ post._id }`)
    .set("Cookie", [`jwt=${token2}`])
    .expect(200);

    const responsePost = response.body.message;
    expect(responsePost.author).toBe(user1._id.toString());
    expect(responsePost.votes).toBe(oldVotes - 2);
    expect(responsePost.upvoters).toStrictEqual([]);
    expect(responsePost.downvoters[0]._id).toBe(user1._id.toString());
    expect(responsePost.downvoters[1]._id).toBe(user2._id.toString());
  });

  it("user not logged in can't downvote", async () => {
    const pact = await Pact.findOne({ id: getTestPactId() });
    const post = await Post.findOne({ id: getTestPostId() });

    const response = await supertest(app)
    .post(`/pact/${ pact._id }/post/downvote/${ post._id }`)
    .expect(401);

    expect(response.body.message).toBe(null);
    expect(response.body.errors[0].field).toBe(null);
    expect(response.body.errors[0].message).toBe(MESSAGES.AUTH.IS_NOT_LOGGED_IN);
    expect(response.body.errors.length).toBe(1);
  });

  it("user not in pact can't downvote", async () => {
    const pact = await Pact.findOne({ id: getTestPactId() });
    const post = await Post.findOne({ id: getTestPostId() });

    // Creating the user who is not in the pact, but who is in the correct uni
    const user = await generateNextTestUser("User");
    user.active = true;
    await user.save();
    const token = createToken(user._id);

    const response = await supertest(app)
    .post(`/pact/${ pact._id }/post/downvote/${ post._id }`)
    .set("Cookie", [`jwt=${ token }`])
    .expect(401);

    console.log(response.body.errors[0].message);
    expect(response.body.message).toBe(null);
    expect(response.body.errors[0].field).toBe(null);
    expect(response.body.errors[0].message).toBe(MESSAGES.AUTH.IS_NOT_IN_PACT);
    expect(response.body.errors.length).toBe(1);
  });
  
});