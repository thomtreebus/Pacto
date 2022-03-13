const Pact = require("../../models/Pact");
const Post = require("../../models/Pact");
const User = require("../../models/User");
const Comment = require("../../models/Comment");
const University = require("../../models/University");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const supertest = require("supertest");
const app = require("../../app");
const { generateTestUser, getTestUserEmail, generateNextTestUser } = require("../fixtures/generateTestUser");
const { generateTestPact, getTestPactId } = require("../fixtures/generateTestPact");
const { generateTestPost, getTestPostId } = require("../fixtures/generateTestPost");
const { createToken } = require("../../controllers/authController");
const { PACT_MESSAGES, MESSAGES, COMMENT_MESSAGES, POST_MESSAGES } = require("../../helpers/messages");

dotenv.config();

const COMMENT_TEXT = "This is my 1st comment.";

describe("POST /pact/:pactId/post/:postId/comment", () =>{
  let commentId = null;
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
    await generateTestPost(user, pact);

    const comment = await Comment.create({
      text: COMMENT_TEXT,
      author: user._id
    });
    await comment.save();
    commentId = comment._id;
  });

	afterEach(async () => {
		await User.deleteMany({});
    await Pact.deleteMany({});
		await University.deleteMany({});
    await Post.deleteMany({});
    await Comment.deleteMany({});
	});

  const sendRequest = async (token, text, expStatus) => {
    const response = await supertest(app)
      .get(`/pact/${getTestPactId()}/post/${getTestPostId()}/comment/${commentId}`)
      .set("Cookie", [`jwt=${token}`])
      .send({text})
      .expect(expStatus);

    return response;
  }

  it("successfully fetches valid comment", async () =>{
    const user = await User.findOne({uniEmail: getTestUserEmail()});
    const token = createToken(user._id);

    const sentText = COMMENT_TEXT;
    const response = await sendRequest(token, sentText, 201);

    expect(response.body.errors.length).toBe(0);
    expect(response.body.message.text).toBe(sentText);
  });

  it("uses checkAuthenticated middleware", async () => {
    const token = "some gibberish";
    const sentText = COMMENT_TEXT;
    const response = await sendRequest(token, sentText, 401);

    expect(response.body.message).toBe(null);
    expect(response.body.errors[0].message).toBe(MESSAGES.AUTH.IS_NOT_LOGGED_IN);
  });

  it("uses checkIsMemberOfPact middleware", async () => {
    const user = await generateNextTestUser("David");
    user.active = true;
    await user.save();

    const token = createToken(user._id);
    const sentText = COMMENT_TEXT;
    const response = await sendRequest(token, sentText, 401);

    expect(response.body.message).toBe(null);
    expect(response.body.errors[0].message).toBe(PACT_MESSAGES.NOT_AUTHORISED);
  });

  it("uses checkValidPost middleware", async () => {
    const user = await User.findOne({ uniEmail: getTestUserEmail() });

    const token = createToken(user._id);
    const response = await supertest(app)
    .get(`/pact/${getTestPactId()}/post/${"some gibberish"}/comment/${commentId}`)
    .set("Cookie", [`jwt=${token}`])
    .send({text})
    .expect(expStatus);

    expect(response.body.message).toBe(null);
    expect(response.body.errors[0].message).toBe(POST_MESSAGES.NOT_FOUND);
  });

  it("uses checkValidPostComment middleware", async () => {
    const user = await User.findOne({ uniEmail: getTestUserEmail() });

    const token = createToken(user._id);
    commentId = "some gibberish";
    const response = await sendRequest(token, 404);
    expect(response.body.message).toBe(null);
    expect(response.body.errors[0].message).toBe(COMMENT_MESSAGES.NOT_FOUND);
  });
});
