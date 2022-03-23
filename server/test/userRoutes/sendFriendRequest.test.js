const User = require("../../models/User");
const FriendRequest = require("../../models/FriendRequest");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = require("../../app");
const supertest = require("supertest");
const { generateTestUser, getDefaultTestUserEmail, generateCustomUniTestUser} = require("../fixtures/generateTestUser");
const { createToken } = require("../../controllers/authController");
const { MESSAGES, FRIEND_MESSAGES, FRIEND_REQUEST_MESSAGES } = require("../../helpers/messages");

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
    const updatedRecipient = await User.findOne({_id: recipientUser._id});

    expect(updatedUser.sentRequests.length).toBe(1);
    expect(updatedUser.sentRequests[0]._id.toString()).toBe(response.body.message._id);
    expect(updatedUser.receivedRequests.length).toBe(0);

    expect(updatedRecipient.sentRequests.length).toBe(0);
    expect(updatedRecipient.receivedRequests.length).toBe(1);
    expect(updatedRecipient.receivedRequests[0]._id.toString()).toBe(response.body.message._id);
  });

  /**
   * user sends requests to recipientUser1,2 and 3.
   * recipientUser1 sends requests to recipientUser2 and 3.
   * recipientUser2 sends request to recipientUser3.
   */
  it("lets users send friend requests to each other", async () => {
    const recipientUser1 = await generateCustomUniTestUser("UserOne", "ucl");
    recipientUser1.active = true;
    recipientUser1.save();
    const recipientUser2 = await generateCustomUniTestUser("UserTwo", "lse");
    recipientUser2.active = true;
    recipientUser2.save();
    const recipientUser3 = await generateCustomUniTestUser("UserThree", "icl");
    recipientUser3.active = true;
    recipientUser3.save();

    const user = await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    const token = createToken(user._id);
    const response = await supertest(app)
    .post(`/friends/${ recipientUser1._id }`)
    .set("Cookie", [`jwt=${ token }`])
    .expect(201)
    expect(response.body.message).toBeDefined();
    expect(response.body.errors.length).toBe(0);
    await supertest(app)
    .post(`/friends/${ recipientUser2._id }`)
    .set("Cookie", [`jwt=${ token }`])
    .expect(201)
    await supertest(app)
    .post(`/friends/${ recipientUser3._id }`)
    .set("Cookie", [`jwt=${ token }`])
    .expect(201)

    const token2 = createToken(recipientUser1._id);
    const response2 = await supertest(app)
    .post(`/friends/${ recipientUser2._id }`)
    .set("Cookie", [`jwt=${ token2 }`])
    .expect(201)
    expect(response2.body.message).toBeDefined();
    expect(response2.body.errors.length).toBe(0);
    await supertest(app)
    .post(`/friends/${ recipientUser3._id }`)
    .set("Cookie", [`jwt=${ token2 }`])
    .expect(201)

    const token3 = createToken(recipientUser2._id);
    await supertest(app)
    .post(`/friends/${ recipientUser3._id }`)
    .set("Cookie", [`jwt=${ token3 }`])
    .expect(201)

    const updatedUser = await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    await updatedUser.populate({path: 'sentRequests', model: FriendRequest});
    await updatedUser.populate({path: 'receivedRequests', model: FriendRequest});
    const updatedRecipient1 = await User.findOne({_id: recipientUser1._id});
    await updatedRecipient1.populate({path: 'sentRequests', model: FriendRequest});
    await updatedRecipient1.populate({path: 'receivedRequests', model: FriendRequest});
    const updatedRecipient2 = await User.findOne({_id: recipientUser2._id});
    await updatedRecipient2.populate({path: 'sentRequests', model: FriendRequest});
    await updatedRecipient2.populate({path: 'receivedRequests', model: FriendRequest});
    const updatedRecipient3 = await User.findOne({_id: recipientUser3._id});
    await updatedRecipient3.populate({path: 'sentRequests', model: FriendRequest});
    await updatedRecipient3.populate({path: 'receivedRequests', model: FriendRequest});

    expect(updatedUser.sentRequests.length).toBe(3);
    expect(updatedUser.sentRequests[0].requestor).toEqual(user._id);
    expect(updatedUser.sentRequests[0].recipient).toEqual(recipientUser1._id);
    expect(updatedUser.sentRequests[1].requestor).toEqual(user._id);
    expect(updatedUser.sentRequests[1].recipient).toEqual(recipientUser2._id);
    expect(updatedUser.sentRequests[2].requestor).toEqual(user._id);
    expect(updatedUser.sentRequests[2].recipient).toEqual(recipientUser3._id);
    expect(updatedUser.receivedRequests.length).toBe(0);

    expect(updatedRecipient1.sentRequests.length).toBe(2);
    expect(updatedRecipient1.sentRequests[0].requestor).toEqual(recipientUser1._id);
    expect(updatedRecipient1.sentRequests[0].recipient).toEqual(recipientUser2._id);
    expect(updatedRecipient1.sentRequests[1].requestor).toEqual(recipientUser1._id);
    expect(updatedRecipient1.sentRequests[1].recipient).toEqual(recipientUser3._id);
    expect(updatedRecipient1.receivedRequests.length).toBe(1);
    expect(updatedRecipient1.receivedRequests[0].requestor).toEqual(user._id);
    expect(updatedRecipient1.receivedRequests[0].recipient).toEqual(recipientUser1._id);

    expect(updatedRecipient2.sentRequests.length).toBe(1);
    expect(updatedRecipient2.sentRequests[0].requestor).toEqual(recipientUser2._id);
    expect(updatedRecipient2.sentRequests[0].recipient).toEqual(recipientUser3._id);
    expect(updatedRecipient2.receivedRequests.length).toBe(2);
    expect(updatedRecipient2.receivedRequests[0].requestor).toEqual(user._id);
    expect(updatedRecipient2.receivedRequests[0].recipient).toEqual(recipientUser2._id);
    expect(updatedRecipient2.receivedRequests[1].requestor).toEqual(recipientUser1._id);
    expect(updatedRecipient2.receivedRequests[1].recipient).toEqual(recipientUser2._id);

    expect(updatedRecipient3.sentRequests.length).toBe(0);
    expect(updatedRecipient3.receivedRequests.length).toBe(3);
    expect(updatedRecipient3.receivedRequests[0].requestor).toEqual(user._id);
    expect(updatedRecipient3.receivedRequests[0].recipient).toEqual(recipientUser3._id);
    expect(updatedRecipient3.receivedRequests[1].requestor).toEqual(recipientUser1._id);
    expect(updatedRecipient3.receivedRequests[1].recipient).toEqual(recipientUser3._id);
    expect(updatedRecipient3.receivedRequests[2].requestor).toEqual(recipientUser2._id);
    expect(updatedRecipient3.receivedRequests[2].recipient).toEqual(recipientUser3._id);
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
    
    const response1 = await supertest(app)
    .post(`/friends/${ recipientUser._id }`)
    .set("Cookie", [`jwt=${ token }`])
    .expect(201)
    expect(response1.body.message).toBeDefined();
    expect(response1.body.errors.length).toBe(0);
    
    const response = await supertest(app)
    .post(`/friends/${ recipientUser._id }`)
    .set("Cookie", [`jwt=${ token }`])
    .expect(400)

    expect(response.body.message).toBeDefined();
    expect(response.body.errors.length).toBe(1);
    expect(response.body.errors[0].field).toBe(null);
    expect(response.body.errors[0].message).toBe(FRIEND_REQUEST_MESSAGES.ALREADY.SENT);
  });

  it("does not let user send a friend request to someone if already received one from that person", async () => {
    const recipientUser = await generateCustomUniTestUser("User", "ucl");
    recipientUser.active = true;
    recipientUser.save();
    const user = await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    
    const recipientToken = createToken(recipientUser._id);
    const token = createToken(user._id);
    
    const response1 = await supertest(app)
    .post(`/friends/${ user._id }`)
    .set("Cookie", [`jwt=${ recipientToken }`])
    .expect(201)
    expect(response1.body.message).toBeDefined();
    expect(response1.body.errors.length).toBe(0);
    
    const response = await supertest(app)
    .post(`/friends/${ recipientUser._id }`)
    .set("Cookie", [`jwt=${ token }`])
    .expect(400)

    expect(response.body.message).toBeDefined();
    expect(response.body.errors.length).toBe(1);
    expect(response.body.errors[0].field).toBe(null);
    expect(response.body.errors[0].message).toBe(FRIEND_REQUEST_MESSAGES.ALREADY.RECEIVED);
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