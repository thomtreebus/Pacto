const supertest = require("supertest");
const app = require("../../app");
const { createToken } = require("../../controllers/authController");
const { generateTestUser, getDefaultTestUserEmail, generateCustomUniTestUser} = require("../fixtures/generateTestUser");
const { generateTestPact, getTestPactId } = require("../fixtures/generateTestPact");
const { MESSAGES, PACT_MESSAGES, POST_MESSAGES } = require("../../helpers/messages");
const User = require("../../models/User");
const Pact = require('../../models/Pact');
const useTestDatabase = require("../helpers/useTestDatabase");

// Magic values
const TITLE = "My post";

const TEXT_TYPE = "text";
const TEXT = "This is my 1st post."
const IMAGE_TYPE = "image";
const IMAGE = "(This is an image)";
const LINK_TYPE = "link";
const LINK = "https://examplelink.com";

const DEFAULT_TYPE = TEXT_TYPE;

describe("POST /pact/:pactId/post", () => {
  useTestDatabase("createPost");

  beforeEach(async () => {
    const user = await generateTestUser();
    user.active = true;
    await user.save();
    // Makes user a member and mod of pact
    const pact = await generateTestPact(user);
    await pact.save();
  });

  it("can create post with valid pact id and user part of pact", async () => {
    const user = await User.findOne({ uniEmail: getDefaultTestUserEmail() });
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
    })
    .expect(201)
    expect(response.body.message).toBeDefined();
    expect(response.body.errors.length).toBe(0);

    const post = response.body.message;
    expect(post.author).toBe(user._id.toString());
    expect(post.title).toBe("Dummy title");
    expect(post.text).toBe("Dummy text");
    expect(post.type).toBe("text");
    expect(post.votes).toBe(0);
  });

  it("can post twice the same content in same pact", async () => {
    const user = await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    const pact = await Pact.findOne({ _id: getTestPactId() });
    const token = createToken(user._id);

    const postContent = {
                          author: user,
                          title: "Dummy title",
                          text: "Dummy text",
                          type: "text",
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
    expect(post.votes).toBe(0);
  });

  // Check uses pactMiddleware
  it("user who is not in the correct uni cannot post", async () => {
    const user = await generateCustomUniTestUser("User", "ucl");
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
    })
    .expect(404);
    expect(response.body.message).toBe(null);
    expect(response.body.errors[0].field).toBe(null);
    expect(response.body.errors[0].message).toBe(PACT_MESSAGES.NOT_FOUND);
    expect(response.body.errors.length).toBe(1);
  });

  // Check uses pactMiddleware
  it("user who is in the correct uni but not in the pact cannot post", async () => {
    const user = await generateTestUser("User");
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
    })
    .expect(401);
    expect(response.body.message).toBe(null);
    expect(response.body.errors[0].field).toBe(null);
    expect(response.body.errors[0].message).toBe(PACT_MESSAGES.NOT_AUTHORISED);
    expect(response.body.errors.length).toBe(1);
  });

  it("check uses authMiddleware", async () => {
    const user = await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    const pact = await Pact.findOne({ _id: getTestPactId() });

    const response = await supertest(app)
    .post(`/pact/${ pact._id }/post`)
    .send({
      author: user,
      title: "Dummy title",
      text: "Dummy text",
      type: "text",
    })
    expect(response.body.message).toBe(null);
    expect(response.body.errors[0].field).toBe(null);
    expect(response.body.errors[0].message).toBe(MESSAGES.AUTH.IS_NOT_LOGGED_IN);
    expect(response.body.errors.length).toBe(1);
  });

  // Helpers
  const isInvalidPost = async (postObject, expErrField, expErrMsg) => {
    const user = await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    const pact = await Pact.findOne({ _id: getTestPactId() });
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

  const isValidPost = async (postObject, expectedTitle=TITLE, expectedType=TEXT_TYPE, expectedText=TEXT) => {
    const user = await User.findOne({ uniEmail: getDefaultTestUserEmail() });
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
    expect(response.body.message.title).toBe(expectedTitle);
    expect(response.body.message.type).toBe(expectedType);
    switch(expectedType) {
      case TEXT_TYPE:
        expect(response.body.message.text).toBe(expectedText);
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
  describe("Title validation", () => {
    it("rejects when title exceeds 50 characters", async () => {
      await isInvalidPost({
        title: "x".repeat(51),
        type: TEXT_TYPE,
        text: TEXT
      }, "title", POST_MESSAGES.TITLE.MAX_LENGTH_EXCEEDED);
    });

    it("trims whitespace from title", async () => {
      await isInvalidPost({
        title: " ",
        type: TEXT_TYPE,
        text: TEXT
      }, "title", POST_MESSAGES.TITLE.BLANK);
    });

    it("accepts when title is exactly 50 characters", async () => {
      await isValidPost({
        title: "x".repeat(50),
        type: TEXT_TYPE,
        text: TEXT
      }, expectedTitle="x".repeat(50));
    });

    it("rejects when title is blank", async () => {
      await isInvalidPost({
        name: TITLE,
        type: TEXT_TYPE,
        text: TEXT
      }, "title", POST_MESSAGES.TITLE.BLANK);
    });
  });

  describe("Type validation", () => {
    it("rejects post with unknown type", async () =>{
      const res = await isInvalidPost({
        title: TITLE,
        type: "notAType"
      }, "type", POST_MESSAGES.TYPE.INVALID);
    });

    it("accepts valid text post with no optional attributes", async () =>{
      await isValidPost({
        title: TITLE,
        type: TEXT_TYPE,
        text: TEXT
      });
    });

    it("rejects text post without text", async () => {
      await isInvalidPost({
        title: TITLE,
        type: TEXT_TYPE
      }, "text", POST_MESSAGES.TYPE.TEXT.BLANK);
    });

    it("trims whitespace from post", async () => {
      await isInvalidPost({
        text: " ",
        title: TITLE,
        type: TEXT_TYPE
      }, "text", POST_MESSAGES.TYPE.TEXT.BLANK);
    });

    it("accepts text post with 1000 characters", async () => {
      await isValidPost({
        title: TITLE,
        type: TEXT_TYPE,
        text: "x".repeat(1000)
      }, undefined, undefined, expectedText="x".repeat(1000));
    });

    it("rejects text post with 1001 characters", async () => {
      await isInvalidPost({
        title: TITLE,
        type: TEXT_TYPE,
        text: "x".repeat(1001)
      }, "text", POST_MESSAGES.TYPE.TEXT.MAX_LENGTH_EXCEEDED);
    });

    it("accepts valid image post with no optional attributes", async () =>{
      await isValidPost({
        title: TITLE,
        type: IMAGE_TYPE,
        text: TEXT,
        image: IMAGE
      }, undefined, expectedType=IMAGE_TYPE);
    });

    it("rejects image post without image", async () => {
      await isInvalidPost({
        title: TITLE,
        type: IMAGE_TYPE
      }, "image", POST_MESSAGES.TYPE.IMAGE.BLANK);
    });

    it("accepts valid link post with no optional attributes", async () =>{
      await isValidPost({
        title: TITLE,
        type: LINK_TYPE,
        text: TEXT,
        link: LINK
      }, undefined, expectedType=LINK_TYPE);
    });

    it("rejects link post without link", async () => {
      await isInvalidPost({
        title: TITLE,
        type: LINK_TYPE
      }, "link", POST_MESSAGES.TYPE.LINK.BLANK);
    });

    it("rejects link post with invalid link", async () => {
      await isInvalidPost({
        title: TITLE,
        type: LINK_TYPE,
        link: "noturl"
      }, "link", POST_MESSAGES.TYPE.LINK.INVALID);
    });

    it("accepts text post with too much information", async () => {
      await isValidPost({
        title: TITLE,
        type: TEXT_TYPE,
        text: TEXT,
        image: IMAGE,
        link: LINK,
      });
    });

    it("accepts image post with too much information", async () => {
      await isValidPost({
        title: TITLE,
        type: IMAGE_TYPE,
        text: TEXT,
        image: IMAGE,
        link: LINK,
      }, undefined, expectedType=IMAGE_TYPE);
    });

    it("accepts link post with too much information", async () => {
      await isValidPost({
        title: TITLE,
        type: LINK_TYPE,
        text: TEXT,
        image: IMAGE,
        link: LINK,
      }, undefined, expectedType=LINK_TYPE);
    });

    it("doesn't verify that the link is valid if the type is text", async () => {
      await isValidPost({
        title: TITLE,
        type: TEXT_TYPE,
        text: TEXT,
        link: "noturl"
      });
    });

    it("doesn't verify that the link is valid if the type is image", async () => {
      await isValidPost({
        title: TITLE,
        type: IMAGE_TYPE,
        image: IMAGE,
        link: "noturl"
      }, undefined, expectedType=IMAGE_TYPE);
    });

    it("rejects post without type and text", async () =>{
      const res = await isInvalidPost({
        title: TITLE
      }, "text", POST_MESSAGES.TYPE.TEXT.BLANK);
    });

    it("assigns default type (text) if absent", async () =>{
      const res = await isValidPost({
        title: TITLE,
        text: TEXT
      });

      expect(res.body.message.type).toBe(DEFAULT_TYPE);
      expect(res.body.message.text).toBe(TEXT);
    });
  });

});