const Pact = require("../../models/Pact");
const User = require("../../models/User");
const University = require("../../models/University");
const Link = require("../../models/Link");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const supertest = require("supertest");
const app = require("../../app");
const { generateTestUser, getDefaultTestUserEmail } = require("../fixtures/generateTestUser");
const { generateTestPact, getTestPactId } = require("../fixtures/generateTestPact");
const { generateTestPost, getTestPostId } = require("../fixtures/generateTestPost");
const { createToken } = require("../../controllers/authController");
const { PACT_MESSAGES, MESSAGES } = require("../../helpers/messages");
const { rest } = require("msw");
const { setupServer } = require("msw/node");

describe("GET /pact/:id", () =>{
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

	afterEach(async () => {
		await User.deleteMany({});
    await Pact.deleteMany({});
		await University.deleteMany({});
    await Link.deleteMany({});
	});

  // Tests
  it("returns appropriate error when id invalid", async () =>{
    const user = await User.findOne({ uniEmail: getDefaultTestUserEmail() });

    const token = createToken(user._id);
    const id = "gibberish";

    const response = await supertest(app)
      .get("/pact/"+id)
      .set("Cookie", [`jwt=${token}`])
      .expect(404);

    expect(response.body.errors[0].message).toBe("Pact not found");
  });  

  it("returns pact relating to id given", async () =>{
    const user = await User.findOne({ uniEmail: getDefaultTestUserEmail() });

    const token = createToken(user._id);
    const id = await getTestPactId();

    const response = await supertest(app)
      .get("/pact/"+id.toString())
      .set("Cookie", [`jwt=${token}`])
      .expect(200);

    expect(response.body.message).toBeDefined();
  });  

  it("uses checkAuthenticated middleware", async () =>{
    const token = "some gibberish";
    const id = await getTestPactId();

    const response = await supertest(app)
      .get("/pact/"+id.toString())
      .set("Cookie", [`jwt=${token}`])
      .expect(401);

    expect(response.body.errors[0].message).toBe(MESSAGES.AUTH.IS_NOT_LOGGED_IN);
  });

  it("returns images, titles and url's for any link posts when available", async () => {
    const user = await User.findOne({ uniEmail: getDefaultTestUserEmail() });

    const token = createToken(user._id);
    const id = await getTestPactId();

    const response = await supertest(app)
      .get("/pact/"+id.toString())
      .set("Cookie", [`jwt=${token}`])
      .expect(200);

    response.body.message.posts.forEach((post) => {
      if (post.type === "link") {
        expect(post.text).toBe("Google")
        expect(post.image).toBe("https://www.google.com/images/logo.png")
      }
    })
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
      .get("/pact/"+id.toString())
      .set("Cookie", [`jwt=${token}`])
      .expect(200);

    response.body.message.posts.forEach((post) => {
      if (post.type === "link") {
        expect(post.text).toBe("")
        expect(post.image).toBe(undefined)
      }
    })
  })
});
