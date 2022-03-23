const User = require("../../models/User");
const FriendRequest = require("../../models/FriendRequest");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = require("../../app");
const supertest = require("supertest");
const { generateTestUser, getDefaultTestUserEmail, generateCustomUniTestUser} = require("../fixtures/generateTestUser");
const { createToken } = require("../../controllers/authController");
const { MESSAGES, FRIEND_REQUEST_MESSAGES } = require("../../helpers/messages");

dotenv.config();

describe("acceptFriendRequest /friends", () => {
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

  it("passes", async () => {
    expect(true).toBe(true);
  });

});