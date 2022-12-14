const supertest = require("supertest");
const app = require("../../../app");
const { createToken } = require("../../../controllers/auth");
const { generateTestUser, getDefaultTestUserEmail} = require("../../fixtures/generateTestUser");
const { generateTestPact, getTestPactId } = require("../../fixtures/generateTestPact");
const { generateTestPost, getTestPostId } = require("../../fixtures/generateTestPost");
const { MESSAGES, PACT_MESSAGES, POST_MESSAGES } = require("../../../helpers/messages");
const User = require("../../../models/User");
const Post = require('../../../models/Post');
const useTestDatabase = require("../../helpers/useTestDatabase");

describe("PUT /pact/:pactId/post/upvote/:postId", () => {
  useTestDatabase();

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

  const sendRequest = async (token, expStatus=200, pactId=getTestPactId(), postId=getTestPostId()) => {
    const response = await supertest(app)
    .put(`/pact/${ pactId }/post/upvote/${ postId }`)
    .set("Cookie", [`jwt=${ token }`])
    .expect(expStatus);

    return response;
  }

  it("uses generic vote method", async () => {
    const user = await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    const post = await Post.findOne({ id: getTestPostId() });
    const oldVotes = post.votes;

    const token = createToken(user._id);
    const response = await sendRequest(token);

    const responsePost = response.body.message;
    expect(responsePost.author).toBe(user._id.toString());
    expect(responsePost.votes).toBe(oldVotes + 1);
    expect(responsePost.downvoters).toStrictEqual([]);
    expect(responsePost.upvoters[0]).toBe(user._id.toString());
  });

  it("fails for non-existent post id", async () => {
    const crapId = "123456789012345678901234"
    const user = await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    const token = createToken(user._id);
    const response = await supertest(app)
    .put(`/pact/${ getTestPactId() }/post/upvote/${ crapId }`)
    .set("Cookie", [`jwt=${ token }`])
    .expect(404);
    expect(response.body.message).toBe(null);
    expect(response.body.errors.length).toBe(1);
    expect(response.body.errors[0].message).toBe(POST_MESSAGES.NOT_FOUND);
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

  
});