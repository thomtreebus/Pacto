const supertest = require("supertest");
const app = require("../../app");
const { createToken } = require("../../controllers/auth");
const { generateTestUser } = require('../fixtures/generateTestUser');
const { MESSAGES } = require("../../helpers/messages");
const useTestDatabase = require("../helpers/useTestDatabase");

describe("GET /me", () => {
  useTestDatabase();

  it("returns a user object when logged in", async () => {
    const user = await generateTestUser();
    user.active = true;
    await user.save();
    const token = createToken(user._id);

    let response = await supertest(app)
      .get("/me")
      .set("Cookie", [`jwt=${token}`]);
    expect(response.body.message).toBeDefined();
    expect(response.body.message._id).toBeDefined();
    expect(response.body.message.firstName).toBeDefined();
    expect(response.body.message.lastName).toBeDefined();
    expect(response.body.message.uniEmail).toBeDefined();
    expect(response.body.errors.length).toBe(0);
  });

  it("uses checkAuthenticated middleware", async () => {
    let response = await supertest(app).get("/me");
    expect(response.body.message).toBe(null);
    expect(response.body.errors[0].field).toBe(null);
    expect(response.body.errors[0].message).toBe(MESSAGES.AUTH.IS_NOT_LOGGED_IN);
    expect(response.body.errors.length).toBe(1);
  });
});