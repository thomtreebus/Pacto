const mongoose = require("mongoose");
const dotenv = require("dotenv");
const EmailVerificationCode = require("../models/EmailVerificationCode");
const supertest = require("supertest");
const bcrypt = require("bcrypt");
const app = require("../app");
const Cookies = require("expect-cookies");
const { createToken } = require("../controllers/authController");
const University = require("../models/University");
const User = require("../models/User");
const { JsonWebTokenError } = require("jsonwebtoken");
const { MESSAGES } = require("../helpers/messages");
const { generateTestUser } = require('./fixtures/generateTestUser');

dotenv.config();

describe("GET /me", () => {
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
    expect(response.body.message.password).toBeDefined();
    expect(response.body.errors.length).toBe(0);
  });

  it("returns an error when the user is not logged in", async () => {
    let response = await supertest(app).get("/me");
    expect(response.body.message).toBe(null);
    expect(response.body.errors[0].field).toBe(null);
    expect(response.body.errors[0].message).toBe("You have to login");
    expect(response.body.errors.length).toBe(1);
  });
});