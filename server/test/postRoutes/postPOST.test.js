const mongoose = require("mongoose");
const dotenv = require("dotenv");
const supertest = require("supertest");
const bcrypt = require("bcrypt");
const app = require("../../app");
const { createToken } = require("../../controllers/authController");
const { generateTestUser, getEmail } = require("../fixtures/generateTestUser");
const { generateTestPact, getTestPactId } = require("../fixtures/generateTestPact");
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

describe("POST /post", () => {
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
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Post.deleteMany({});
    await Pact.deleteMany({});
  });

  it("can create post with valid pact id and user part of pact", async () => {
    const user = await User.findOne({ uniEmail: getEmail() });
    const pact = await Pact.findOne({ id: getTestPactId() });
    const token = createToken(user._id);
    const response = await supertest(app)
    .post("/post/" + pact._id)
    .set("Cookie", [`jwt=${token}`])
    .send({
      author: user,
      title: "Dummy title",
      text: "Dummy text",
      type: "text",
      link: "somelink"
    })
    .expect(201)
    expect(response.body.message).toBeDefined();
    expect(response.body.errors.length).toBe(0);

    const post = response.body.message;
    expect(post.author).toBe(user._id.toString());
    expect(post.title).toBe("Dummy title");
    expect(post.text).toBe("Dummy text");
    expect(post.type).toBe("text");
    expect(post.link).toBe("somelink");
    expect(post.votes).toBe(0);
  });

  // test for cases it doesn't work, like user not part of pact
});