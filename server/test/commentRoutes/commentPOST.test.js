const Pact = require("../../models/Pact");
const Post = require("../../models/Pact");
const User = require("../../models/User");
const Comment = require("../../models/Comment");
const University = require("../../models/University");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const supertest = require("supertest");
const app = require("../../app");
const { generateTestUser, getTestUserEmail } = require("../fixtures/generateTestUser");
const { generateTestPact, getTestPactId } = require("../fixtures/generateTestPact");
const { generateTestPost, getTestPostId } = require("../fixtures/generateTestPost");
const { createToken } = require("../../controllers/authController");
const { PACT_MESSAGES, MESSAGES } = require("../../helpers/messages");

dotenv.config();

const COMMENT_TEXT = "This is my 1st comment.";

describe("POST /pact/:pactId/post/:postId/comment", () =>{
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
  });

	afterEach(async () => {
		await User.deleteMany({});
    await Pact.deleteMany({});
		await University.deleteMany({});
    await Post.deleteMany({});
    await Comment.deleteMany({});
	});

  const sendRequest = async (user, text, expStatus) => {
    const token = createToken(user._id);
    const response = await supertest(app)
      .post(`/pact/${getTestPactId()}/post/${getTestPostId()}/comment`)
      .set("Cookie", [`jwt=${token}`])
      .send({text})
      .expect(expStatus);

    return response;
  }

  it("successfully creates a valid comment", async () =>{
    const sentText = COMMENT_TEXT;
    const user = await User.findOne({uniEmail: getTestUserEmail()});
    const response = await sendRequest(user, sentText, 201);

    expect(response.body.errors.length).toBe(0);
    expect(response.body.message.text).toBe(sentText);
  });
});
