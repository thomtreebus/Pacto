const mongoose = require("mongoose");
const dotenv = require("dotenv");
const supertest = require("supertest");
const bcrypt = require("bcrypt");
const app = require("../../app");
const { createToken } = require("../../controllers/authController");
const { generateTestUser, getTestUserEmail } = require("../fixtures/generateTestUser");
const { generateTestPact, getTestPactId } = require("../fixtures/generateTestPact");
const { generateTestPost, getTestPostId } = require("../fixtures/generateTestPost");
const { jsonResponse } = require("../../helpers/responseHandlers");
const { MESSAGES, PACT_MESSAGES, POST_MESSAGES } = require("../../helpers/messages");
const User = require("../../models/User");
const Pact = require('../../models/Pact');
const University = require('../../models/University');
const Post = require('../../models/Post');

dotenv.config();

describe("DELETE /pact/:pactId/post/delete/:postId", () => {
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

  it("can delete an existing post", async () => {
    const user = await User.findOne({ uniEmail: getTestUserEmail() });
    let pact = await Pact.findOne({ id: getTestPactId() });
    const post = await Post.findOne({ id: getTestPostId() });
    const token = createToken(user._id);
    
    expect(pact.posts.includes(post._id)).toBe(true);
    const response = await supertest(app)
    .delete(`/pact/${ pact._id }/post/delete/${ post._id }`)
    .set("Cookie", [`jwt=${token}`])
    .expect(200);
    expect(response.body.message).toBeDefined();
    expect(response.body.errors.length).toBe(0);

    const responsePost = response.body.message;
    expect(responsePost.author).toBe(user._id.toString());

    const deletedPost = await Post.findOne({ id: responsePost._id });
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
    .delete(`/pact/${ pact._id }/post/delete/${ invalidPostId }`)
    .set("Cookie", [`jwt=${token}`])
    .expect(404);
    expect(response.body.message).toBeDefined();
    expect(response.body.errors.length).toBe(1);
    expect(response.body.errors[0].field).toBe(null);
    expect(response.body.errors[0].message).toBe(POST_MESSAGES.NOT_FOUND);
    expect(pact.posts.includes(invalidPostId)).toBe(false);
  });

});