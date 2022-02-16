const mongoose = require("mongoose");
const dotenv = require("dotenv");
const supertest = require("supertest");
const bcrypt = require("bcrypt");
const app = require("../../app");
const { createToken } = require("../../controllers/authController");
const { generateTestUser, getEmail } = require("../fixtures/generateTestUser");
const { generateTestPact, getTestPactId } = require("../fixtures/generateTestPact");
const { generateTestPost, getTestPostId } = require("../fixtures/generateTestPost");
const { jsonResponse } = require("../../helpers/responseHandlers");
const University = require('../../models/University')
const User = require("../../models/User");
const Pact = require('../../models/Pact')
const Post = require('../../models/Post')

dotenv.config();

// const getNoMemberPact = async () => {
//   const uni = await University.create( { name: "kcl", domains: ["kcl.ac.uk"] });

//   // Create a test pact
//   const pact = await Pact.create({
//     name: "Chess club",
//     university: uni,
//     category: "subject"
//   })

//   return pact;
// }

describe("GET /post/:pactid/:id", () => {
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

  it("can get a post with valid pact id and user part of pact", async () => {
    const user = await User.findOne({ uniEmail: getEmail() });
    const pact = await Pact.findOne({ id: getTestPactId() });
    const post = await Post.findOne({ id: getTestPostId() });
    const token = createToken(user._id);

    const response = await supertest(app)
    .get("/post/" + pact._id + "/" + post._id)
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

  // test for cases it doesn't work, like user not part of pact
});