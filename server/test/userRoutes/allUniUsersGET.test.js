const supertest = require("supertest");
const app = require("../../app");
const { createToken } = require("../../controllers/authController");
const { generateTestUser } = require('../fixtures/generateTestUser');
const { MESSAGES } = require("../../helpers/messages");
const useTestDatabase = require("../helpers/useTestDatabase");

describe("GET /users", () => {
  useTestDatabase();

  it("active logged in user can see all university members", async () => {
    const user1 = await generateTestUser("userOne");
    user1.active = true;
    user1.save();
    const user2 = await generateTestUser("userTwo");
    user2.active = true;
    user2.save();

    const loggedInUser = await generateTestUser("userThree")
    loggedInUser.active = true;
    loggedInUser.save();

    const token = createToken(loggedInUser._id);

    let response = await supertest(app)
      .get("/users/")
      .set("Cookie", [`jwt=${token}`]);
    expect(response.body.errors).toHaveLength(0);
    expect(response.body.message).toHaveLength(3);
    expect(response.status).toBe(200);
  });

  it("Inactive user can not view other people's profile", async () => {
    const user1 = await generateTestUser("userOne");
    user1.active = true;
    user1.save();
    const user2 = await generateTestUser("userTwo");
    user2.active = true;
    user2.save();

    const loggedInUser = await generateTestUser("userThree")
    loggedInUser.active = false;
    await loggedInUser.save();
    loggedInUser.university = null;

    const token = createToken(loggedInUser._id);

    let response = await supertest(app)
      .get("/users/")
      .set("Cookie", [`jwt=${token}`]);
    expect(response.body.errors).toHaveLength(1);
    expect(response.body.errors[0]['field']).toBeNull;
    expect(response.body.errors[0]['message']).toBe(MESSAGES.AUTH.IS_INACTIVE)
    expect(response.body.message).toBeNull;
    expect(response.status).toBe(401);
  });

  it("Does not return users that are inactive", async () => {
    const user1 = await generateTestUser("userOne");
    user1.active = true;
    user1.save();
    const inactiveUser = await generateTestUser("userTwo");

    const loggedInUser = await generateTestUser("userThree")
    loggedInUser.active = true;
    loggedInUser.save();

    const token = createToken(loggedInUser._id);

    let response = await supertest(app)
      .get("/users/")
      .set("Cookie", [`jwt=${token}`]);
    expect(response.body.errors).toHaveLength(0);
    expect(response.body.message).toHaveLength(2);
    expect(response.status).toBe(200);
  });

});