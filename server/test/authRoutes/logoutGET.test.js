const supertest = require("supertest");
const app = require("../../app");
const Cookies = require("expect-cookies");
const { createToken } = require("../../controllers/authController");
const User = require("../../models/User");
const { generateTestUser, getDefaultTestUserEmail } = require('../fixtures/generateTestUser');
const useTestDatabase = require("../helpers/useTestDatabase");

describe("GET /logout", () => {
  useTestDatabase("logout");

  beforeEach(async () => {
    const user = await generateTestUser();
    user.active = true;
    await user.save();
  });

  // Tests
  it("clears the cookie even for non-logged in users", async () => {
    const response = await supertest(app)
      .get("/logout")
      .expect(Cookies.set({name: "jwt", options: ["max-age"]}));

    expect(response.statusCode).toBe(200);
  });

  it("returns OK and cookie with max-age set when user logged in", async () => {
    const user = await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    const token = createToken(user._id);
    const response = await supertest(app)
      .get("/logout")
      .set("Cookie", [`jwt=${token}`])
      .expect(Cookies.set({name: "jwt", options: ["max-age"]}));

    expect(response.statusCode).toBe(200);
  });
});