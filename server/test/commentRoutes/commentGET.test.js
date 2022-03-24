const User = require("../../models/User");
const Comment = require("../../models/Comment");
const supertest = require("supertest");
const app = require("../../app");
const { generateTestUser, getDefaultTestUserEmail} = require("../fixtures/generateTestUser");
const { generateTestPact, getTestPactId } = require("../fixtures/generateTestPact");
const { generateTestPost, getTestPostId } = require("../fixtures/generateTestPost");
const { createToken } = require("../../controllers/authController");
const { PACT_MESSAGES, MESSAGES, COMMENT_MESSAGES, POST_MESSAGES } = require("../../helpers/messages");
const useTestDatabase = require("../helpers/useTestDatabase");

const COMMENT_TEXT = "Some random text."

describe("GET /pact/:pactId/post/:postId/comment/:commentId", () =>{
  useTestDatabase("getComment");
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

  const sendRequest = async (token, expStatus) => {
    const response = await supertest(app)
      .get(`/pact/${getTestPactId()}/post/${getTestPostId()}/comment/${commentId}`)
      .set("Cookie", [`jwt=${token}`])
      .expect(expStatus);

    return response;
  }

  it("successfully fetches valid comment", async () =>{
    const user = await User.findOne({uniEmail: getDefaultTestUserEmail()});
    const token = createToken(user._id);

    const response = await sendRequest(token, 200);

    expect(response.body.errors.length).toBe(0);
    expect(response.body.message.text).toBe(COMMENT_TEXT);
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
