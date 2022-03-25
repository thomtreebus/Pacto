const User = require("../../models/User");
const app = require("../../app");
const supertest = require("supertest");
const { generateTestUser, getDefaultTestUserEmail, generateCustomUniTestUser} = require("../fixtures/generateTestUser");
const { createToken } = require("../../controllers/authController");
const { MESSAGES, FRIEND_MESSAGES } = require("../../helpers/messages");
const useTestDatabase = require("../helpers/useTestDatabase");

describe("deleteFriend /friends", () => {
  useTestDatabase("deleteFriendRequest");

  beforeEach(async () => {
    const user = await generateTestUser();
    user.active = true;
    await user.save();
  });

  it("lets user delete a friend", async () => {
    // Make 2 users be friends
    const user = await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    const friend = await generateCustomUniTestUser("Friend", "ucl");
    await User.findByIdAndUpdate(user._id, { $push: { friends: friend._id } });
    await User.findByIdAndUpdate(friend._id, { $push: { friends: user._id } });
    let updatedUser = await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    let updatedFriend = await User.findOne({ _id: friend._id });
    expect(updatedUser.friends.length).toBe(1);
    expect(updatedFriend.friends.length).toBe(1);
    expect(updatedUser.friends[0]._id).toEqual(friend._id);
    expect(updatedFriend.friends[0]._id).toEqual(user._id);

    // Delete the friend
    const token = createToken(user._id);
    const response = await supertest(app)
    .put(`/friends/remove/${ friend._id }`)
    .set("Cookie", [`jwt=${ token }`])
    .expect(201);
    expect(response.body.message).toBeDefined();
    expect(response.body.errors.length).toBe(0);

    updatedUser = await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    updatedFriend = await User.findOne({ _id: friend._id });

    expect(updatedUser.friends.length).toBe(0);
    expect(updatedFriend.friends.length).toBe(0);
  });

  it("can't delete if is a non-existing user", async () => {
    const nonExistingFriendId = 999999999;

    const user = await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    const token = createToken(user._id);
    const response = await supertest(app)
    .put(`/friends/remove/${ nonExistingFriendId }`)
    .set("Cookie", [`jwt=${ token }`])
    .expect(404);
    expect(response.body.message).toBeDefined();
    expect(response.body.errors[0].field).toBe(null);
    expect(response.body.errors.length).toBe(1);
    expect(response.body.errors[0].message).toBe(FRIEND_MESSAGES.NOT_FOUND);
  });

  it("can't delete if isn't a friend", async () => {
    // Make 2 users who are NOT friends
    const user = await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    const notFriend = await generateCustomUniTestUser("Friend", "ucl");
    expect(user.friends.length).toBe(0);
    expect(notFriend.friends.length).toBe(0);

    const token = createToken(user._id);
    const response = await supertest(app)
    .put(`/friends/remove/${ notFriend._id }`)
    .set("Cookie", [`jwt=${ token }`])
    .expect(400);
    expect(response.body.message).toBeDefined();
    expect(response.body.errors[0].field).toBe(null);
    expect(response.body.errors.length).toBe(1);
    expect(response.body.errors[0].message).toBe(FRIEND_MESSAGES.NOT_FRIEND);
  });

  it("check uses authMiddleware", async () => {
    // Make 2 users be friends
    const user = await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    const friend = await generateCustomUniTestUser("Friend", "ucl");
    await User.findByIdAndUpdate(user._id, { $push: { friends: friend._id } });
    await User.findByIdAndUpdate(friend._id, { $push: { friends: user._id } });
    let updatedUser = await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    let updatedFriend = await User.findOne({ _id: friend._id });
    expect(updatedUser.friends.length).toBe(1);
    expect(updatedFriend.friends.length).toBe(1);
    expect(updatedUser.friends[0]._id).toEqual(friend._id);
    expect(updatedFriend.friends[0]._id).toEqual(user._id);
    
    const response = await supertest(app)
    .put(`/friends/remove/${ friend._id }`);

    expect(response.body.message).toBe(null);
    expect(response.body.errors[0].field).toBe(null);
    expect(response.body.errors[0].message).toBe(MESSAGES.AUTH.IS_NOT_LOGGED_IN);
    expect(response.body.errors.length).toBe(1);
  });

});