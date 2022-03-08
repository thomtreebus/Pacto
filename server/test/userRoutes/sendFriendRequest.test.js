const User = require("../../models/User");
const FriendRequest = require("../../models/FriendRequest");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = require("../../app");
const supertest = require("supertest");
const { generateTestUser, getDefaultTestUserEmail, generateCustomUniTestUser} = require("../fixtures/generateTestUser");
const { createToken } = require("../../controllers/authController");
const { MESSAGES, FRIEND_MESSAGES } = require("../../helpers/messages");

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

    const updatedUser = await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    const updatedRecipient = await User.findOne({_id: recipientUser._id})
    expect(updatedUser.sentRequests.length).toBe(1);
    expect(updatedRecipient.receivedRequests.length).toBe(1);
  });

  it("does not let user send a friend request to existing friend", async () => {
    const recipientUser = await generateCustomUniTestUser("User", "ucl");
    const user = await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    const friends = [user._id];
    await User.findByIdAndUpdate(recipientUser._id, {friends});
    
    const token = createToken(user._id);
    const response = await supertest(app)
    .post(`/friends/${ recipientUser._id }`)
    .set("Cookie", [`jwt=${ token }`])
    .expect(400)

    expect(response.body.message).toBeDefined();
    expect(response.body.errors[0].field).toBe(null);
    expect(response.body.errors.length).toBe(1);
    expect(response.body.errors[0].message).toBe(FRIEND_MESSAGES.ALREADY_FRIEND);
  });

  it("does not let user send a friend request if request has already been sent", async () => {
    const recipientUser = await generateCustomUniTestUser("User", "ucl");
    const user = await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    const token = createToken(user._id);
    
    const request = await FriendRequest.create({requestor: user, recipient: recipientUser});
    const sentRequests = [request._id];
    await User.findByIdAndUpdate(recipientUser._id, {sentRequests});
    
    await supertest(app)
    .post(`/friends/${ recipientUser._id }`)
    .set("Cookie", [`jwt=${ token }`])
    .expect(400)

    expect(response.body.message).toBeDefined();
    expect(response.body.errors.length).toBe(1);
    expect(response.body.errors[0].field).toBe(null);
    expect(response.body.errors[0].message).toBe(FRIEND_MESSAGES.ALREADY_SENT);
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