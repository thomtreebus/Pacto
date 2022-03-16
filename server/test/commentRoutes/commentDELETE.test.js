const Pact = require("../../models/Pact");
const Post = require("../../models/Pact");
const User = require("../../models/User");
const Comment = require("../../models/Comment");
const University = require("../../models/University");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const supertest = require("supertest");
const app = require("../../app");
const { generateTestUser, getDefaultTestUserEmail} = require("../fixtures/generateTestUser");
const { generateTestPact, getTestPactId } = require("../fixtures/generateTestPact");
const { generateTestPost, getTestPostId } = require("../fixtures/generateTestPost");
const { createToken } = require("../../controllers/authController");
const { PACT_MESSAGES, MESSAGES, COMMENT_MESSAGES, POST_MESSAGES } = require("../../helpers/messages");

dotenv.config();

const COMMENT_TEXT = "Some random text.";

describe("DELETE /pact/:pactId/post/:postId/comment/:commentId", () =>{
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

  const sendRequest = async (token, expStatus) => {
    const response = await supertest(app)
      .delete(`/pact/${getTestPactId()}/post/${getTestPostId()}/comment/${commentId}`)
      .set("Cookie", [`jwt=${token}`])
      .expect(expStatus);

    return response;
  }

  it("successfully deletes comment posted by user", async () =>{
    const user = await User.findOne({uniEmail: getDefaultTestUserEmail()});
    const token = createToken(user._id);

    const response = await sendRequest(token, 200);
    const comment = response.body.message;
    expect(comment.text).toBe(COMMENT_MESSAGES.DELETED_COMMENT_TEXT);
    expect(comment.deleted).toBe(true);
    expect(comment.author._id.toString()).toBe(user._id.toString()); // not changed by deletion
  });

  it("moderator successfully deletes comment posted by another user", async () =>{
    const user = await generateTestUser("David");
    user.active = true;
    await user.save();

    const pact = await Pact.findById(getTestPactId());
    pact.moderators.push(user);
    pact.members.push(user);
    await pact.save();

    user.pacts.push(pact);
    await user.save();

    const token = createToken(user._id);

    const response = await sendRequest(token, 200);

    const comment = response.body.message;
    expect(comment.text).toBe(COMMENT_MESSAGES.DELETED_COMMENT_TEXT);
    expect(comment.deleted).toBe(true);
  });

  // This reason this is tested separately is that it is not done in a middleware.
  it("rejections deletion when user is neither author or moderator", async () =>{
    const user = await generateTestUser("David");
    user.active = true;
    await user.save();

    const pact = await Pact.findById(getTestPactId());
    pact.members.push(user);
    await pact.save();
    
    user.pacts.push(pact);
    await user.save();
    
    const token = createToken(user._id);

    const response = await sendRequest(token, 401);
    expect(response.body.message).toBe(null);
    expect(response.body.errors[0].message).toBe(COMMENT_MESSAGES.NOT_AUTHORISED.MODIFY);
  });

  it("uses checkAuthenticated middleware", async () => {
    const token = "some gibberish";
    const response = await sendRequest(token, 401);

    expect(response.body.message).toBe(null);
    expect(response.body.errors[0].message).toBe(MESSAGES.AUTH.IS_NOT_LOGGED_IN);
  });

  it("uses checkIsMemberOfPact middleware", async () => {
    const user = await generateTestUser("David");
    user.active = true;
    await user.save();

    const token = createToken(user._id);
    const response = await sendRequest(token, 401);

    expect(response.body.message).toBe(null);
    expect(response.body.errors[0].message).toBe(PACT_MESSAGES.NOT_AUTHORISED);
  });

  it("uses checkValidPost middleware", async () => {
    const user = await User.findOne({ uniEmail: getDefaultTestUserEmail() });

    const token = createToken(user._id);
    const response = await supertest(app)
    .get(`/pact/${getTestPactId()}/post/${"some gibberish"}/comment/${commentId}`)
    .set("Cookie", [`jwt=${token}`])
    .expect(404);

    expect(response.body.message).toBe(null);
    expect(response.body.errors[0].message).toBe(POST_MESSAGES.NOT_FOUND);
  });

  it("uses checkValidPostComment middleware", async () => {
    const user = await User.findOne({ uniEmail: getDefaultTestUserEmail() });

    const token = createToken(user._id);
    commentId = "some gibberish";
    const response = await sendRequest(token, 404);
    expect(response.body.message).toBe(null);
    expect(response.body.errors[0].message).toBe(COMMENT_MESSAGES.NOT_FOUND);
  });
});
