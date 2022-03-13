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
const { MESSAGES, PACT_MESSAGES, POST_MESSAGES } = require("../../helpers/messages");
const User = require("../../models/User");
const Pact = require('../../models/Pact');
const University = require('../../models/University');
const Post = require('../../models/Post');

dotenv.config();

describe("DELETE /pact/:pactId/post/:postId", () => {
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

  it("member can delete a post they made", async () => {
    // The user is a member of the pact, not a mod
    const user = await User.findOne({ uniEmail: getTestUserEmail() });
    const pact = await Pact.findOne({ _id: getTestPactId() });

    expect(pact.moderators.includes(user._id)).toBe(true);
    await pact.moderators.pull({ _id: user._id });
    await pact.save();
    expect(pact.moderators.includes(user._id)).toBe(false);

    const post = await Post.findOne({ _id: getTestPostId() });
    const token = createToken(user._id);
    
    const response = await supertest(app)
    .delete(`/pact/${ pact._id }/post/${ post._id }`)
    .set("Cookie", [`jwt=${token}`])
    .expect(204);

    expect(response.body.toString()).toBe({}.toString());

    const deletedPost = await Post.findOne({ id: post._id });
    expect(deletedPost).toBe(null);

    pact = await Pact.findOne({ id: getTestPactId() });
    expect(pact.posts.includes(post._id)).toBe(false);
  });

  it("cannot delete a non-existing post", async () => {
    const user = await User.findOne({ uniEmail: getTestUserEmail() });
    const pact = await Pact.findOne({ id: getTestPactId() });
    const invalidPostId = 123;
    const token = createToken(user._id);

    expect(pact.posts.includes(invalidPostId)).toBe(false);
    const response = await supertest(app)
    .delete(`/pact/${ pact._id }/post/${ invalidPostId }`)
    .set("Cookie", [`jwt=${token}`])
    .expect(404);
    expect(response.body.message).toBe(null);
    expect(response.body.errors.length).toBe(1);
    expect(response.body.errors[0].field).toBe(null);
    expect(response.body.errors[0].message).toBe(POST_MESSAGES.NOT_FOUND);
    expect(pact.posts.includes(invalidPostId)).toBe(false);
  });

  it("moderator of a pact can delete any post in the pact", async () => {
    const user = await User.findOne({ uniEmail: getTestUserEmail() });
    let pact = await Pact.findOne({ id: getTestPactId() });
    const post = await Post.findOne({ id: getTestPostId() });

    // Creating 2nd user: a moderator
    const user2 = await generateNextTestUser("Mod");
    user2.active = true;
    await user2.pacts.push(pact);
    await user2.save();
    await pact.members.push(user2);
    await pact.moderators.push(user2);
    await pact.save();
    const token = createToken(user2._id);
    
    expect(pact.posts.includes(post._id)).toBe(true);
    const response = await supertest(app)
    .delete(`/pact/${ pact._id }/post/${ post._id }`)
    .set("Cookie", [`jwt=${token}`])
    .expect(204);
    expect(response.body.toString()).toBe({}.toString());

    const deletedPost = await Post.findOne({ id: post._id });
    expect(deletedPost).toBe(null);

    pact = await Pact.findOne({ id: getTestPactId() });
    expect(pact.posts.includes(post._id)).toBe(false);
  });

  it("member of a pact cannot delete any other post than their own", async () => {
    const user = await User.findOne({ uniEmail: getTestUserEmail() });
    let pact = await Pact.findOne({ id: getTestPactId() });
    const post = await Post.findOne({ id: getTestPostId() });

    // Creating 2nd member (not mod) of pact
    const user2 = await generateNextTestUser("Member");
    user2.active = true;
    await user2.pacts.push(pact);
    await user2.save();
    await pact.members.push(user2);
    await pact.save();
    const token = createToken(user2._id);
    
    expect(pact.posts.includes(post._id)).toBe(true);
    const response = await supertest(app)
    .delete(`/pact/${ pact._id }/post/${ post._id }`)
    .set("Cookie", [`jwt=${token}`])
    .expect(401);
    expect(response.body.message).toBe(null);
    expect(response.body.errors[0].field).toBe(null);
    expect(response.body.errors[0].message).toBe(POST_MESSAGES.NOT_AUTHORISED.NOT_AUTHOR_NOT_MOD);
    expect(response.body.errors.length).toBe(1);

    const notDeletedPost = await Post.findOne({ id: getTestPostId() });
    expect(notDeletedPost).toStrictEqual(post);

    pact = await Pact.findOne({ id: getTestPactId() });
    expect(pact.posts.includes(post._id)).toBe(true);
  });

  // Check uses pactMiddleware
  it("user who is not in the correct uni cannot delete", async () => {
    const user = await generateNextTestUser("User", notkcl = true, uniname = "ucl");
    user.active = true;
    await user.save();
    const post = await Post.findOne({ id: getTestPostId() });
    const pact = await Pact.findOne({ id: getTestPactId() });
    const token = createToken(user._id);

    expect(pact.posts.includes(post._id)).toBe(true);

    const response = await supertest(app)
    .delete(`/pact/${ pact._id }/post/${ post._id }`)
    .set("Cookie", [`jwt=${ token }`])
    .expect(404);
    expect(response.body.message).toBe(null);
    expect(response.body.errors[0].field).toBe(null);
    expect(response.body.errors[0].message).toBe(PACT_MESSAGES.NOT_FOUND);
    expect(response.body.errors.length).toBe(1);

    expect(pact.posts.includes(post._id)).toBe(true);
    const notDeletedPost = await Post.findOne({ id: getTestPostId() });
    expect(notDeletedPost).toBeDefined();
  });

  // Check uses pactMiddleware
  it("user who is in the correct uni but not in the pact cannot delete", async () => {
    const user = await generateNextTestUser("User");
    user.active = true;
    await user.save();
    const post = await Post.findOne({ id: getTestPostId() });
    const pact = await Pact.findOne({ id: getTestPactId() });
    const token = createToken(user._id);

    expect(pact.posts.includes(post._id)).toBe(true);

    const response = await supertest(app)
    .delete(`/pact/${ pact._id }/post/${ post._id }`)
    .set("Cookie", [`jwt=${ token }`])
    .expect(401);
    expect(response.body.message).toBe(null);
    expect(response.body.errors[0].field).toBe(null);
    expect(response.body.errors[0].message).toBe(PACT_MESSAGES.NOT_AUTHORISED);
    expect(response.body.errors.length).toBe(1);
  });

  it("check uses authMiddleware", async () => {
    const pact = await Pact.findOne({ id: getTestPactId() });
    const post = await Post.findOne({ id: getTestPostId() })

    const response = await supertest(app)
    .delete(`/pact/${ pact._id }/post/${ post._id }`)
    .expect(401);
    expect(response.body.message).toBe(null);
    expect(response.body.errors[0].field).toBe(null);
    expect(response.body.errors[0].message).toBe(MESSAGES.AUTH.IS_NOT_LOGGED_IN);
    expect(response.body.errors.length).toBe(1);
  });

});