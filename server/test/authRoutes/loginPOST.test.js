const mongoose = require("mongoose");
const dotenv = require("dotenv");
const supertest = require("supertest");
const app = require("../../app");
const Cookies = require("expect-cookies");
const User = require("../../models/User");
const University = require("../../models/University");
const { generateTestUser, getTestUserEmail } = require('../fixtures/generateTestUser');
const { MESSAGES } = require("../../helpers/messages");

dotenv.config();

describe("POST /login", () => {
  beforeAll(async () => {
		await mongoose.connect(process.env.TEST_DB_CONNECTION_URL);
	});

	afterAll(async () => {
		await mongoose.connection.close();
	});

	afterEach(async () => {
		await User.deleteMany({});
		await University.deleteMany({});
	});

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
      { uniEmail: getTestUserEmail() },
      { active: false }
    );
    await isInvalidCredentials(
      "pac.to@kcl.ac.uk",
      "Password123",
      MESSAGES.LOGIN.INACTIVE_ACCOUNT
    );
  });
});