const User = require("../../models/User");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = require("../../app");
const supertest = require("supertest");
const { generateTestUser, getDefaultTestUserEmail, generateCustomUniTestUser} = require("../fixtures/generateTestUser");
const { createToken } = require("../../controllers/authController");
const { MESSAGES, FRIEND_REQUEST_MESSAGES } = require("../../helpers/messages");

dotenv.config();


describe("sendFriendRequest /friends", () => {
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
    const recipientUser = await generateCustomUniTestUser("pacTwo");
    recipientUser.active = true;
    await recipientUser.save();
  });

	afterEach(async () => {
		await User.deleteMany({});
	});

  it("lets user send a friend request to another user", async () => {
    const recipientUser = await generateCustomUniTestUser("User", "ucl");
    const user = await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    const token = createToken(user._id);
    const response = await supertest(app)
    .post(`/friends/${ recipientUser._id }`)
    .set("Cookie", [`jwt=${ token }`])
    .expect(201)
    expect(response.body.message).toBeDefined();
    expect(response.body.errors.length).toBe(0);
  })
});