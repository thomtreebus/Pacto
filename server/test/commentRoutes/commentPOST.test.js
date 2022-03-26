const User = require("../../models/User");
const supertest = require("supertest");
const app = require("../../app");
const { generateTestUser, getDefaultTestUserEmail} = require("../fixtures/generateTestUser");
const { generateTestPact, getTestPactId } = require("../fixtures/generateTestPact");
const { generateTestPost, getTestPostId } = require("../fixtures/generateTestPost");
const { createToken } = require("../../controllers/authController");
const { PACT_MESSAGES, MESSAGES, COMMENT_MESSAGES } = require("../../helpers/messages");
const useTestDatabase = require("../helpers/useTestDatabase");

const COMMENT_TEXT = "This is my 1st comment.";

describe("POST /pact/:pactId/post/:postId/comment", () =>{
  useTestDatabase("createComment");

  beforeEach(async () => {
    const user = await generateTestUser();
    user.active = true;
    await user.save();

    const pact = await generateTestPact(user);
    await generateTestPost(user, pact);
  });

  const sendRequest = async (token, text, expStatus) => {
    const response = await supertest(app)
      .post(`/pact/${getTestPactId()}/post/${getTestPostId()}/comment`)
      .set("Cookie", [`jwt=${token}`])
      .send({text})
      .expect(expStatus);

    return response;
  }

  it("successfully creates a valid comment", async () =>{
    const user = await User.findOne({uniEmail: getDefaultTestUserEmail()});
    const token = createToken(user._id);

    const sentText = COMMENT_TEXT;
    const response = await sendRequest(token, sentText, 201);

    expect(response.body.errors.length).toBe(0);
    expect(response.body.message.text).toBe(sentText);
  });

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
