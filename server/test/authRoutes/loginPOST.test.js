const supertest = require("supertest");
const app = require("../../app");
const Cookies = require("expect-cookies");
const User = require("../../models/User");
const { generateTestUser, getDefaultTestUserEmail } = require('../fixtures/generateTestUser');
const { MESSAGES } = require("../../helpers/messages");
const useTestDatabase = require("../helpers/useTestDatabase");

describe("POST /login", () => {
  useTestDatabase("login");

  beforeEach(async () => {
    const user = await generateTestUser();
    user.active = true;
    await user.save();
  });

  // Helpers
  async function isInvalidCredentials(uniEmail, password,	msg = MESSAGES.LOGIN.INVALID_CREDENTIALS) {
    const response = await supertest(app)
      .post("/login")
      .send({
        uniEmail,
        password,
      })
      .expect(400);

    expect(response.body.message).toBe(null);
    expect(response.body.errors[0].field).toBe(null);
    expect(response.body.errors[0].message).toBe(msg);
    expect(response.body.errors.length).toBe(1);
  }

  async function isValidCredentials(uniEmail, password) {
    const response = await supertest(app)
      .post("/login")
      .send({
        uniEmail,
        password,
      })
      .expect(200)
      .expect(
        Cookies.set({
          name: "jwt",
          options: ["httponly"],
        })
      );
    expect(response.body.message).toBeDefined();
    expect(response.body.errors.length).toBe(0);
  }

  // Tests
  // Not using getDefaultTestUserEmail for invalid inputs
  it("rejects invalid email", async () => {
    await isInvalidCredentials("pac.to", "Password123");
  });

  it("rejects incorrect email", async () => {
    await isInvalidCredentials("pac.to1@kcl.ac.uk", "Password123");
  });

  it("rejects invalid password", async () => {
    await isInvalidCredentials("pac.to@kcl.ac.uk", "Password1");
  });

  it("rejects invalid email and password", async () => {
    await isInvalidCredentials("pac.to1@kcl.ac.uk", "Password1");
  });

  it("logs the user in when the credentials are correct", async () => {
    await isValidCredentials("pac.to@kcl.ac.uk", "Password123");
  });

  it("rejects inactive user with correct credentials", async () => {
    await User.findOneAndUpdate(
      { uniEmail: getDefaultTestUserEmail() },
      { active: false }
    );
    await isInvalidCredentials(
      "pac.to@kcl.ac.uk",
      "Password123",
      MESSAGES.LOGIN.INACTIVE_ACCOUNT
    );
  });
});