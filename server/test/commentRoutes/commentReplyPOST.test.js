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
const { PACT_MESSAGES, MESSAGES, COMMENT_MESSAGES } = require("../../helpers/messages");

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
    const post = await generateTestPost(user, pact);

    const comment = await Comment.create({
      text: COMMENT_TEXT,
      author: user._id
    });
    await comment.save();
    commentId = comment._id;

    post.comments.push(comment);
    await post.save();
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
      .post(`/pact/${getTestPactId()}/post/${getTestPostId()}/comment/${commentId}/reply`)
      .set("Cookie", [`jwt=${token}`])
      .send({text})
      .expect(expStatus);

    return response;
  }

  it("successfully creates a valid comment as reply", async () =>{
    const user = await User.findOne({uniEmail: getTestUserEmail()});
    const token = createToken(user._id);

    const sentText = COMMENT_TEXT;
    const response = await sendRequest(token, sentText, 201);

    const parent = await Comment.findById(commentId);

    expect(response.body.errors.length).toBe(0);
    expect(response.body.message.text).toBe(sentText);

    expect(response.body.message.parentComment._id.toString()).toEqual(parent._id.toString());
    expect(parent.childComments[0].toString()).toEqual(response.body.message._id.toString());
  });

  it("rejects blank comment", async () =>{
    const user = await User.findOne({uniEmail: getTestUserEmail()});
    const token = createToken(user._id);

    const sentText = "";
    const response = await sendRequest(token, sentText, 400);

    expect(response.body.errors.length).toBe(1);
    expect(response.body.errors[0].message).toBe(COMMENT_MESSAGES.BLANK);
  });

  it("accepts 512 char comment", async () =>{
    const user = await User.findOne({uniEmail: getTestUserEmail()});
    const token = createToken(user._id);

    const sentText = "x".repeat(512);
    const response = await sendRequest(token, sentText, 201);
  });

  it("rejects 513 char comment", async () =>{
    const user = await User.findOne({uniEmail: getTestUserEmail()});
    const token = createToken(user._id);

    const sentText = "x".repeat(513);
    const response = await sendRequest(token, sentText, 400);

    expect(response.body.errors.length).toBe(1);
    expect(response.body.errors[0].message).toBe(COMMENT_MESSAGES.MAX_LENGTH_EXCEEDED);
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
});
