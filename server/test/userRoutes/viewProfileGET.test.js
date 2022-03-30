const supertest = require("supertest");
const app = require("../../app");
const { createToken } = require("../../controllers/authController");
const { generateTestUser } = require('../fixtures/generateTestUser');
const {getDefaultTestUser} = require("../helpers/defaultTestUser");
const {MESSAGES, USER_MESSAGES} = require("../../helpers/messages");
const useTestDatabase = require("../helpers/useTestDatabase");

describe("GET /users/:id", () => {
  useTestDatabase();

  it("logged in user can see their profile data", async () => {
    const user = await generateTestUser();
    const testValues = getDefaultTestUser();
    user.active = true;
    await user.save();
    const token = createToken(user._id);

    let response = await supertest(app)
      .get("/users/"+user._id)
      .set("Cookie", [`jwt=${token}`]);
    expect(response.body.errors).toHaveLength(0);
    expect(response.body.message._id).toBe((user._id).toString());
    expect(response.body.message.firstName).toBe(testValues.firstName);
    expect(response.body.message.lastName).toBe(testValues.lastName);
    expect(response.body.message.university.name).toBe("kcl");
  });

  it("logged in user can view other people's profile data", async () => {
    const loggedInUser = await generateTestUser();
    loggedInUser.active = true;
    await loggedInUser.save();
    const token = createToken(loggedInUser._id);

    const otherUserFirstName = "jimmy"
    const otherUser = await generateTestUser(otherUserFirstName);
    const testValues = getDefaultTestUser();
    testValues.firstName = otherUserFirstName;
    otherUser.active = true;
    await otherUser.save();

    let response = await supertest(app)
      .get("/users/"+otherUser._id)
      .set("Cookie", [`jwt=${token}`]);
    expect(response.body.errors).toHaveLength(0);
    expect(response.body.message._id).toBe((otherUser._id).toString());
    expect(response.body.message.firstName).toBe(testValues.firstName);
    expect(response.body.message.lastName).toBe(testValues.lastName);
    expect(response.body.message.university.name).toBe("kcl");
  });

  it("doesn't return data if not logged in", async () => {
    const user = await generateTestUser();
    user.active = true;
    await user.save();

    let response = await supertest(app)
      .get("/users/"+user._id);
    expect(response.body.errors).toHaveLength(1);
    expect(response.body.errors[0].message).toBe(MESSAGES.AUTH.IS_NOT_LOGGED_IN);
    expect(response.body.message).toBe(null);
  });

  it("doesn't return data if user not exist", async () => {
    const user = await generateTestUser();
    user.active = true;
    await user.save();
    const token = createToken(user._id);

    let response = await supertest(app)
      .get("/users/"+"999999999999999999999999999999999999999")
      .set("Cookie", [`jwt=${token}`]);
    expect(response.body.errors).toHaveLength(1);
    expect(response.body.errors[0].message).toBe(USER_MESSAGES.DOES_NOT_EXIST);
    expect(response.body.message).toBe(null);
  });

  it("inactive user does not return user profile data", async () => {
    const loggedInUser = await generateTestUser();
    loggedInUser.active = true;
    await loggedInUser.save();
    const token = createToken(loggedInUser._id);

    const otherUserFirstName = "jimmy"
    const otherUser = await generateTestUser(otherUserFirstName);
    const testValues = getDefaultTestUser();
    testValues.firstName = otherUserFirstName;
    otherUser.active = false;
    await otherUser.save();

    let response = await supertest(app)
      .get("/users/"+otherUser._id)
      .set("Cookie", [`jwt=${token}`]);
    expect(response.body.errors).toHaveLength(1);
    expect(response.body.errors[0].message).toBe(USER_MESSAGES.NOT_ACTIVE);
    expect(response.body.message).toBe(null);
    expect(response.status).toBe(423);
  });

});