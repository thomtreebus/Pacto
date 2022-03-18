const mongoose = require("mongoose");
const dotenv = require("dotenv");
const supertest = require("supertest");
const bcrypt = require("bcrypt");
const app = require("../../app");
const { createToken } = require("../../controllers/authController");
const { generateTestUser, getTestUserEmail, generateNextTestUser } = require("../fixtures/generateTestUser");
const { generateTestPact, getTestPactId } = require("../fixtures/generateTestPact");
const { MESSAGES, PACT_MESSAGES } = require("../../helpers/messages");
const { jsonResponse } = require("../../helpers/responseHandlers");
const University = require('../../models/University');
const User = require("../../models/User");
const Pact = require('../../models/Pact');
const Post = require('../../models/Post');

dotenv.config();

// Magic values
const TITLE = "My post";

const TEXT_TYPE = "text";
const TEXT = "This is my 1st post."
const IMAGE_TYPE = "image";
const IMAGE = "(This is an image)";
const LINK_TYPE = "link";
const LINK = "https://examplelink.com";

const DEFAULT_DESCRIPTION = "A Pact that doesn't know what it wants to be...";
const DEFAULT_CATEGORY = "other";

describe("POST /pact/:pactId/post", () => {
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
    await University.deleteMany({});
  });

  it("can create post with valid pact id and user part of pact", async () => {
    const user = await User.findOne({ uniEmail: getTestUserEmail() });
    const pact = await Pact.findOne({ _id: getTestPactId() });
    const token = createToken(user._id);
    const response = await supertest(app)
    .post(`/pact/${ pact._id }/post`)
    .set("Cookie", [`jwt=${ token }`])
    .send({
      author: user,
      title: "Dummy title",
      text: "Dummy text",
      type: "text",
      link: "https://example.com"
    })
    .expect(201)
    expect(response.body.message).toBeDefined();
    expect(response.body.errors.length).toBe(0);

    const post = response.body.message;
    expect(post.author).toBe(user._id.toString());
    expect(post.title).toBe("Dummy title");
    expect(post.text).toBe("Dummy text");
    expect(post.type).toBe("text");
    expect(post.link).toBe("https://example.com");
    expect(post.votes).toBe(0);
  });

  it("can post twice the same content in same pact", async () => {
    const user = await User.findOne({ uniEmail: getTestUserEmail() });
    const pact = await Pact.findOne({ _id: getTestPactId() });
    const token = createToken(user._id);

    const postContent = {
                          author: user,
                          title: "Dummy title",
                          text: "Dummy text",
                          type: "text",
                          link: "https://example.com"
                        };

    const response1 = await supertest(app)
    .post(`/pact/${ pact._id }/post`)
    .set("Cookie", [`jwt=${ token }`])
    .send(postContent)
    .expect(201)
    expect(response1.body.message).toBeDefined();
    expect(response1.body.errors.length).toBe(0);

    const response2 = await supertest(app)
    .post(`/pact/${ pact._id }/post`)
    .set("Cookie", [`jwt=${ token }`])
    .send(postContent)
    .expect(201)
    expect(response2.body.message).toBeDefined();
    expect(response2.body.errors.length).toBe(0);

    const post = response2.body.message;
    expect(post.author).toBe(user._id.toString());
    expect(post.title).toBe("Dummy title");
    expect(post.text).toBe("Dummy text");
    expect(post.type).toBe("text");
    expect(post.link).toBe("https://example.com");
    expect(post.votes).toBe(0);
  });

  // Check uses pactMiddleware
  it("user who is not in the correct uni cannot post", async () => {
    const user = await generateNextTestUser("User", notkcl = true, uniname = "ucl");
    user.active = true;
    await user.save();
    const token = createToken(user._id);

    const pact = await Pact.findOne({ _id: getTestPactId() });

    const response = await supertest(app)
    .post(`/pact/${ pact._id }/post`)
    .set("Cookie", [`jwt=${ token }`])
    .send({
      author: user,
      title: "Dummy title",
      text: "Dummy text",
      type: "text",
      link: "https://example.com"
    })
    .expect(404);
    expect(response.body.message).toBe(null);
    expect(response.body.errors[0].field).toBe(null);
    expect(response.body.errors[0].message).toBe(PACT_MESSAGES.NOT_FOUND);
    expect(response.body.errors.length).toBe(1);
  });

  // Check uses pactMiddleware
  it("user who is in the correct uni but not in the pact cannot post", async () => {
    const user = await generateNextTestUser("User");
    user.active = true;
    await user.save();
    const token = createToken(user._id);

    const pact = await Pact.findOne({ _id: getTestPactId() });

    const response = await supertest(app)
    .post(`/pact/${ pact._id }/post`)
    .set("Cookie", [`jwt=${ token }`])
    .send({
      author: user,
      title: "Dummy title",
      text: "Dummy text",
      type: "text",
      link: "https://example.com"
    })
    .expect(401);
    expect(response.body.message).toBe(null);
    expect(response.body.errors[0].field).toBe(null);
    expect(response.body.errors[0].message).toBe(PACT_MESSAGES.NOT_AUTHORISED);
    expect(response.body.errors.length).toBe(1);
  });

  it("check uses authMiddleware", async () => {
    const user = await User.findOne({ uniEmail: getTestUserEmail() });
    const pact = await Pact.findOne({ _id: getTestPactId() });

    const response = await supertest(app)
    .post(`/pact/${ pact._id }/post`)
    .send({
      author: user,
      title: "Dummy title",
      text: "Dummy text",
      type: "text",
      link: "https://example.com"
    })
    expect(response.body.message).toBe(null);
    expect(response.body.errors[0].field).toBe(null);
    expect(response.body.errors[0].message).toBe(MESSAGES.AUTH.IS_NOT_LOGGED_IN);
    expect(response.body.errors.length).toBe(1);
  });

  // Helpers
  const isInvalidPost = async (postObject, expErrField, expErrMsg) => {
    const user = await User.findOne({ uniEmail: getTestUserEmail() });
    const token = createToken(user._id);
    const response = await supertest(app)
      .post(`/pact/${ pact._id }/post`)
      .set("Cookie", [`jwt=${token}`])
      .send(postObject)
      .expect(400);
    
    expect(response.body.message).toBe(null);
    expect(response.body.errors[0].field).toBe(expErrField);
    expect(response.body.errors[0].message).toBe(expErrMsg);
  }

  const isValidPost = async (postObject, expectedType=TEXT_TYPE) => {
    const user = await User.findOne({ uniEmail: getTestUserEmail() });
    const pact = await Pact.findOne({ _id: getTestPactId() });
    const token = createToken(user._id);
    const response = await supertest(app)
      .post(`/pact/${ pact._id }/post`)
      .set("Cookie", [`jwt=${token}`])
      .send(postObject)
      .expect(201);
    
    expect(response.body.message).toBeDefined();
    expect(user.pacts.includes(response.body.message.pact)).toBe(true);
    expect(response.body.message.pact.toString()).toEqual(pact._id.toString());
    expect(response.body.message.author.toString()).toEqual(user._id.toString());
    expect(response.body.message.title).toBe(TITLE);
    expect(response.body.message.type).toBe(expectedType);
    switch(expectedType) {
      case TEXT_TYPE:
        expect(response.body.message.text).toBe(TEXT);
        break;
      case IMAGE_TYPE:
        expect(response.body.message.image).toBe(IMAGE);
        break;
      case LINK_TYPE:
        expect(response.body.message.link).toBe(LINK);
        break;
    }
    expect(response.body.message.votes).toBe(0);
    expect(response.body.message.upvoters.length).toBe(0);
    expect(response.body.message.downvoters.length).toBe(0);
    expect(response.body.message.comments.length).toBe(0);
    expect(response.body.errors.length).toBe(0);

    const updatedPact = await Pact.findOne({ _id: getTestPactId() });
    expect(updatedPact.posts.length).toBe(1);

    return response;
  }

  // Validation tests
  it("accepts valid text post with no optional attributes", async () =>{
    await isValidPost({
      title: TITLE,
      type: TEXT_TYPE,
      text: TEXT
    });
  });
});