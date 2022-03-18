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
const { checkValidPost, checkValidPostComment } = require("../../middleware/postMiddleware");
const { checkAuthenticated } = require("../../middleware/authMiddleware");
const { checkIsMemberOfPact } = require("../../middleware/pactMiddleware");
const { jsonResponse } = require("../../helpers/responseHandlers");

dotenv.config();

const COMMENT_TEXT = "Some random text."

describe("Post/Comment Middlewares", () =>{
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

  app.get("/mockRoute/:pactId/:postId/:commentId", checkAuthenticated, checkIsMemberOfPact, checkValidPost, checkValidPostComment, function (req, res) {
    res.status(200).json(jsonResponse({post: req.post, comment: req.comment}, []));
  });

  const sendMockRoute = async (token, expStatus, postId, commentId) => {
    const response = await supertest(app)
      .get(`/mockRoute/${getTestPactId()}/${postId}/${commentId}`)
      .set("Cookie", [`jwt=${token}`])
      .expect(expStatus);

    return response;
  }

  it("handles valid post and comment IDs", async () =>{
    const user = await User.findOne({uniEmail: getDefaultTestUserEmail()});
    const token = createToken(user._id);

    const postId = getTestPostId();

    const res = await sendMockRoute(token, 200, postId, commentId);

    expect(res.body.message.post._id.toString()).toBe(postId.toString());
    expect(res.body.message.comment._id.toString()).toBe(commentId.toString());
  });

  describe("checkValidPost", () => {
    it("throws 404 error on invalid id", async () =>{
      const user = await User.findOne({uniEmail: getDefaultTestUserEmail()});
      const token = createToken(user._id);
  
      const postId = "some gibberish";
  
      const res = await sendMockRoute(token, 404, postId, commentId);
      expect(res.body.errors[0].message).toBe(POST_MESSAGES.NOT_FOUND);
    });
  });

  describe("checkValidPostComment", () => {
    it("throws 404 error on invalid id", async () =>{
      const user = await User.findOne({uniEmail: getDefaultTestUserEmail()});
      const token = createToken(user._id);
  
      const postId = getTestPostId();
      commentId = "some gibberish";
  
      const res = await sendMockRoute(token, 404, postId, commentId);
      expect(res.body.errors[0].message).toBe(COMMENT_MESSAGES.NOT_FOUND);
    });

    it("throws 404 error on comment not on given post", async () =>{
      const user = await User.findOne({uniEmail: getDefaultTestUserEmail()});
      const token = createToken(user._id);

      const pact = await Pact.findById(getTestPactId());
  
      await generateTestPost(user, pact);
      const wrongPostId = getTestPostId();
  
      const res = await sendMockRoute(token, 404, wrongPostId, commentId);
      expect(res.body.errors[0].message).toBe(COMMENT_MESSAGES.NOT_FOUND);
    });
  });
});
