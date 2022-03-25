const User = require("../../models/User");
const Post = require("../../models/Post");
const supertest = require("supertest");
const app = require("../../app");
const { generateTestUser, getDefaultTestUserEmail } = require("../fixtures/generateTestUser");
const { generateTestPact, getTestPactId } = require("../fixtures/generateTestPact");
const { generateTestPost, getTestPostId } = require("../fixtures/generateTestPost");
const { createToken } = require("../../controllers/authController");
const { MESSAGES } = require("../../helpers/messages");
const { rest } = require("msw");
const { setupServer } = require("msw/node");
const useTestDatabase = require("../helpers/useTestDatabase");

describe("GET /feed", () =>{
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

  useTestDatabase("feed");

  beforeEach(async () => {
    server.resetHandlers();
    const user = await generateTestUser();
    user.active = true;
    await user.save();

    const pact = await generateTestPact(user);
    await pact.save();

    post = await generateTestPost(user, pact);
    await post.save();
    post2 = await generateTestPost(user, pact, "randomtitle", "", "link", "http://google.com");
    await post2.save();
  });

  // Tests
  it("returns posts for pacts a user is member of in order by date/time", async () => {
    const user = await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    const post = await Post.findOne({ id: getTestPostId });
    const token = createToken(user._id);

    const response = await supertest(app)
      .get("/feed")
      .set("Cookie", [`jwt=${token}`])
      .expect(200);

    expect(response.body.message).toBeDefined();
    expect(response.body.message.length).toBe(2);    
  })

  it("uses checkAuthenticated middleware", async () =>{
    const token = "some gibberish";
    const id = await getTestPactId();

    const response = await supertest(app)
      .get("/feed")
      .set("Cookie", [`jwt=${token}`])
      .expect(401);

    expect(response.body.errors[0].message).toBe(MESSAGES.AUTH.IS_NOT_LOGGED_IN);
  });

  it("returns just url's for any link posts when a preview couldn't be fetched", async () => {
    server.use(
      rest.post(`${process.env.LINKPREVIEW_URL}`, (req, res, ctx) => {
        return res(
          ctx.status(400)
        );
      })
    );

    const user = await User.findOne({ uniEmail: getDefaultTestUserEmail() });

    const token = createToken(user._id);
    const id = await getTestPactId();

    const response = await supertest(app)
      .get("/feed")
      .set("Cookie", [`jwt=${token}`])
      .expect(200);

    response.body.message.forEach((post) => {
      if (post.type === "link") {
        expect(post.text).toBe("")
        expect(post.image).toBe(undefined)
      }
    })
  })
});