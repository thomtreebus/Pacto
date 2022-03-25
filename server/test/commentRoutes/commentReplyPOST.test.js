const User = require("../../models/User");
const Comment = require("../../models/Comment");
const University = require("../../models/University");
const Notification = require("../../models/Notification");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const supertest = require("supertest");
const app = require("../../app");
const { generateTestUser, getDefaultTestUserEmail} = require("../fixtures/generateTestUser");
const { generateTestPact, getTestPactId } = require("../fixtures/generateTestPact");
const { generateTestPost, getTestPostId } = require("../fixtures/generateTestPost");
const { createToken } = require("../../controllers/authController");
const { PACT_MESSAGES, MESSAGES, COMMENT_MESSAGES } = require("../../helpers/messages");
const useTestDatabase = require("../helpers/useTestDatabase");

const COMMENT_TEXT = "This is my 1st comment.";

describe("POST /pact/:pactId/post/:postId/comment/:commentId/reply", () =>{
  useTestDatabase("replyToComment");
  let commentId = null;

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
    await Notification.deleteMany({});
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
    const user = await User.findOne({uniEmail: getDefaultTestUserEmail()});
    const token = createToken(user._id);

    const sentText = COMMENT_TEXT;
    const response = await sendRequest(token, sentText, 201);

    const parent = await Comment.findById(commentId);

    expect(response.body.errors.length).toBe(0);
    expect(response.body.message.text).toBe(sentText);

    expect(response.body.message.parentComment._id.toString()).toEqual(parent._id.toString());
    expect(parent.childComments[0].toString()).toEqual(response.body.message._id.toString());
  });

  // it("notifies parent comment author a reply has been left", async () => {
  //   const user = await User.findOne({uniEmail: getDefaultTestUserEmail()});
  //   const token = createToken(user._id);

  //   const sentText = COMMENT_TEXT;
  //   const response = await sendRequest(token, sentText, 201);

  //   const parent = await Comment.findById(commentId);
  //   const parentAuthor = await User.findOne({ id: parent.author });
  //   const beforeCount = parentAuthor.notifications.length;

  //   expect(response.body.errors.length).toBe(0);
  //   expect(response.body.message.text).toBe(sentText);

  //   expect(response.body.message.parentComment._id.toString()).toEqual(parent._id.toString());
  //   expect(parent.childComments[0].toString()).toEqual(response.body.message._id.toString());

  //   const updatedAuthor = await User.findOne({ id: parent.author });
  //   const afterCount = updatedAuthor.notifications.length;
  //   expect(afterCount).toBe(beforeCount + 1);
    

  //   const notification = await Notification.findOne({ user: parent.author });
  //   expect(notification).toBeDefined();
  //   expect(notification.user._id.toString()).toBe(author._id.toString());
  //   expect(notification.text).toBe("Your post received a new comment");
  // })

  it("rejects blank comment", async () =>{
    const user = await User.findOne({uniEmail: getDefaultTestUserEmail()});
    const token = createToken(user._id);

    const sentText = "";
    const response = await sendRequest(token, sentText, 400);

    expect(response.body.errors.length).toBe(1);
    expect(response.body.errors[0].message).toBe(COMMENT_MESSAGES.BLANK);
  });

  it("accepts 512 char comment", async () =>{
    const user = await User.findOne({uniEmail: getDefaultTestUserEmail()});
    const token = createToken(user._id);

    const sentText = "x".repeat(512);
    const response = await sendRequest(token, sentText, 201);
  });

  it("rejects 513 char comment", async () =>{
    const user = await User.findOne({uniEmail: getDefaultTestUserEmail()});
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
    const user = await generateTestUser("David");
    user.active = true;
    await user.save();

    const token = createToken(user._id);
    const sentText = COMMENT_TEXT;
    const response = await sendRequest(token, sentText, 401);

    expect(response.body.message).toBe(null);
    expect(response.body.errors[0].message).toBe(PACT_MESSAGES.NOT_AUTHORISED);
  });
});
