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
  });

	afterEach(async () => {
		await User.deleteMany({});
	});

  it("lets user accept a friend request they received", async () => {
    const recipientUser = await generateCustomUniTestUser("User", "ucl");
    recipientUser.active = true;
    recipientUser.save();

    const user = await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    const token = createToken(user._id);
    const res = await supertest(app)
    .post(`/friends/${ recipientUser._id }`)
    .set("Cookie", [`jwt=${ token }`])
    .expect(201);
    const request = res.body.message;

    const recipientToken = createToken(recipientUser._id);
    const response = await supertest(app)
    .put(`/friends/${ request._id }/accept`)
    .set("Cookie", [`jwt=${ recipientToken }`])
    .expect(201);
    expect(response.body.message).toBeDefined();
    expect(response.body.errors.length).toBe(0);

    const updatedUser = await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    const updatedRecipient = await User.findOne({ _id: recipientUser._id});
    const nullRequest = await FriendRequest.findOne({ _id: request._id })

    expect(updatedUser.friends.length).toBe(1);
    expect(updatedRecipient.friends.length).toBe(1);

    expect(updatedUser.friends[0]._id).toEqual(recipientUser._id);
    expect(updatedRecipient.friends[0]._id).toEqual(user._id);

    expect(nullRequest).toBe(null);
    expect(updatedUser.sentRequests.length).toBe(0);
    expect(updatedUser.receivedRequests.length).toBe(0);
    expect(updatedRecipient.sentRequests.length).toBe(0);
    expect(updatedRecipient.receivedRequests.length).toBe(0);
  });

  it("can't accept a request received by someone else", async () => {
    
  });

  it("can't accept a non-existent request", async () => {
    
  });

  it("check uses authMiddleware", async () => {
    const recipientUser = await generateCustomUniTestUser("User", "ucl");
    const user = await User.findOne({ uniEmail: getDefaultTestUserEmail() });

    const response = await supertest(app)
    .post(`/friends/${ recipientUser._id }`)

    expect(response.body.message).toBe(null);
    expect(response.body.errors[0].field).toBe(null);
    expect(response.body.errors[0].message).toBe(MESSAGES.AUTH.IS_NOT_LOGGED_IN);
    expect(response.body.errors.length).toBe(1);
  });

});