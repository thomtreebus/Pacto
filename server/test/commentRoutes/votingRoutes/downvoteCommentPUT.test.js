const supertest = require("supertest");
const app = require("../../../app");
const { createToken } = require("../../../controllers/authController");
const { generateTestUser, getDefaultTestUserEmail} = require("../../fixtures/generateTestUser");
const { generateTestPact, getTestPactId } = require("../../fixtures/generateTestPact");
const { generateTestPost, getTestPostId } = require("../../fixtures/generateTestPost");
const { MESSAGES, PACT_MESSAGES, POST_MESSAGES, COMMENT_MESSAGES } = require("../../../helpers/messages");
const User = require("../../../models/User");
const Post = require('../../../models/Post');
const Comment = require('../../../models/Comment');
const useTestDatabase = require("../../helpers/useTestDatabase");

const COMMENT_TEXT = "comment here."
describe("PUT /pact/:pactId/post/:postId/comment/:commentId/downvote", () => {
  useTestDatabase()
  let commentId = null;

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

    const comment = await Comment.create({
      text: COMMENT_TEXT,
      author: user._id
    });
    await comment.save();
    commentId = comment._id;

    post.comments.push(comment);
    await post.save();
  });

  const sendRequest = async (token, expStatus=200, pactId=getTestPactId(), postId=getTestPostId()) => {
    const response = await supertest(app)
    .put(`/pact/${ pactId }/post/${ postId }/comment/${commentId}/downvote`)
    .set("Cookie", [`jwt=${ token }`])
    .expect(expStatus);

    return response;
  }

  it("uses generic vote method", async () => {
    const user = await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    const comment = await Comment.findById(commentId);
    const oldVotes = comment.votes;

    const token = createToken(user._id);
    const response = await sendRequest(token);

    const responseComment = response.body.message;
    expect(responseComment.author._id.toString()).toBe(user._id.toString());
    expect(responseComment.votes).toBe(oldVotes - 1);
    expect(responseComment.upvoters).toStrictEqual([]);
    expect(responseComment.downvoters[0]).toBe(user._id.toString());
  });

  it("uses checkAuthenticated middleware", async () => {
    const post = await Post.findOne({ id: getTestPostId() });

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
    const response = await sendRequest(token, 404, getTestPactId(), "some gibberish");
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