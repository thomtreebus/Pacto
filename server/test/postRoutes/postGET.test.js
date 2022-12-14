const mongoose = require("mongoose");
const dotenv = require("dotenv");
const supertest = require("supertest");
const app = require("../../app");
const { createToken } = require("../../controllers/auth");
const { generateTestUser, getDefaultTestUserEmail} = require("../fixtures/generateTestUser");
const { generateTestPact } = require("../fixtures/generateTestPact");
const { generateTestPost } = require("../fixtures/generateTestPost");
const { MESSAGES, PACT_MESSAGES, POST_MESSAGES } = require("../../helpers/messages");
const User = require("../../models/User");
const Pact = require('../../models/Pact');
const University = require('../../models/University');
const Post = require('../../models/Post');
const Link = require("../../models/Link")
const { rest } = require("msw");
const { setupServer } = require("msw/node");

dotenv.config();

describe("GET /pact/:pactId/post/:postId", () => {
  let user = undefined;
  let pact = undefined;
  let post = undefined;
  let post2 = undefined;

  const server = setupServer(
		rest.post(`${process.env.LINKPREVIEW_URL}`, (req, res, ctx) => {
			return res(
				ctx.status(200),
				ctx.json({
					title: "Google",
          image: "https://www.google.com/images/logo.png"
				})
			);
		})
	);

  beforeAll(async () => {
    server.listen({ onUnhandledRequest: "bypass" });
    await mongoose.connect(`${process.env.TEST_DB_CONNECTION_URL}`);
  });

  afterAll(async () => {
    server.close();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    server.resetHandlers();
    user = await generateTestUser();
    user.active = true;
    await user.save();
    // Makes user a member and mod of pact
    pact = await generateTestPact(user);
    await pact.save();
    // User posts a post in the pact
    post = await generateTestPost(user, pact);
    await post.save();
    post2 = await generateTestPost(user, pact, "randomTitle", "", "link", "http://google.com");
    await post2.save();
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Post.deleteMany({});
    await Pact.deleteMany({});
    await University.deleteMany({});
    await Link.deleteMany({});
  });

  it("author can get its post", async () => {
    const token = createToken(user._id);

    const response = await supertest(app)
    .get(`/pact/${ pact._id }/post/${ post._id }`)
    .set("Cookie", [`jwt=${token}`])
    .expect(200);
    expect(response.body.message).toBeDefined();
    expect(response.body.errors.length).toBe(0);

    const responsePost = response.body.message;
    expect(responsePost.author._id.toString()).toBe(user._id.toString());
    expect(responsePost.title).toBe(post.title);
    expect(responsePost.text).toBe(post.text);
    expect(responsePost.type).toBe(post.type);
    expect(responsePost.link).toBe(post.link);
    expect(responsePost.votes).toBe(post.votes);
  });

  it("other member of the pact can get the post", async () => {
    // Creating 2nd user
    const user2 = await generateTestUser("SecondUser");
    user2.active = true;
    await user2.pacts.push(pact);
    await user2.save();
    await pact.members.push(user2);
    await pact.save();
    const token = createToken(user2._id);

    const response = await supertest(app)
    .get(`/pact/${ pact._id }/post/${ post._id }`)
    .set("Cookie", [`jwt=${token}`])
    .expect(200);
    expect(response.body.message).toBeDefined();
    expect(response.body.errors.length).toBe(0);

    const responsePost = response.body.message;
    expect(responsePost.author._id.toString()).toBe(user._id.toString());
    expect(responsePost.title).toBe(post.title);
    expect(responsePost.text).toBe(post.text);
    expect(responsePost.type).toBe(post.type);
    expect(responsePost.link).toBe(post.link);
    expect(responsePost.votes).toBe(post.votes);
  });

  it("cannot get a non-existing post", async () => {
    const invalidPostId = 3;
    const token = createToken(user._id);

    const response = await supertest(app)
    .get(`/pact/${ pact._id }/post/${ invalidPostId }`)
    .set("Cookie", [`jwt=${token}`])
    .expect(404);
    expect(response.body.message).toBeDefined();
    expect(response.body.errors.length).toBe(1);
    expect(response.body.errors[0].field).toBe(null);
    expect(response.body.errors[0].message).toBe(POST_MESSAGES.NOT_FOUND);
  });

  // Check uses pactMiddleware
  it("user in correct uni but not in the pact cannot get the post", async () => {
    // Creating the user who is in the correct uni but not in the pact
    const user2 = await generateTestUser("User");
    user2.active = true;
    await user2.save();
    const token = createToken(user2._id);


    const response = await supertest(app)
    .get(`/pact/${ pact._id }/post/${ post._id }`)
    .set("Cookie", [`jwt=${token}`])
    .expect(401);
    expect(response.body.message).toBe(null);
    expect(response.body.errors[0].field).toBe(null);
    expect(response.body.errors[0].message).toBe(PACT_MESSAGES.NOT_AUTHORISED);
    expect(response.body.errors.length).toBe(1);
  });

  it("check uses authMiddleware", async () => {
    const response = await supertest(app)
    .get(`/pact/${ pact._id }/post/${ post._id }`)
    .expect(401);
    expect(response.body.message).toBe(null);
    expect(response.body.errors[0].field).toBe(null);
    expect(response.body.errors[0].message).toBe(MESSAGES.AUTH.IS_NOT_LOGGED_IN);
    expect(response.body.errors.length).toBe(1);
  });

  it("returns image, title and url for link post when available", async () => {
    const user = await User.findOne({ uniEmail: getDefaultTestUserEmail() });

    const token = createToken(user._id);

    const response = await supertest(app)
      .get(`/pact/${ pact._id }/post/${ post2._id }`)
      .set("Cookie", [`jwt=${token}`])
      .expect(200);

    const post_ = response.body.message
    expect(post_.text).toBe("Google")
    expect(post_.image).toBe("https://www.google.com/images/logo.png")
  });

  it("returns just url for a link post when a preview couldn't be fetched", async () => {
    server.use(
      rest.post(`${process.env.LINKPREVIEW_URL}`, (req, res, ctx) => {
        return res(
          ctx.status(400)
        );
      })
    );

    const user = await User.findOne({ uniEmail: getDefaultTestUserEmail() });

    const token = createToken(user._id);

    const response = await supertest(app)
      .get(`/pact/${ pact._id }/post/${ post2._id }`)
      .set("Cookie", [`jwt=${token}`])
      .expect(200);

    const post_ = response.body.message
    expect(post_.text).toBe("")
    expect(post_.image).toBe(undefined)
  })
});
