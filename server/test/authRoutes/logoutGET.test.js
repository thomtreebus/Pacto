const mongoose = require("mongoose");
const dotenv = require("dotenv");
const supertest = require("supertest");
const app = require("../../app");
const Cookies = require("expect-cookies");
const { createToken } = require("../../controllers/authController");
const University = require("../../models/University");
const User = require("../../models/User");
const { generateTestUser, getEmail } = require('../fixtures/generateTestUser');

dotenv.config();

describe("GET /logout", () => {
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

  it("clears the cookie even for non-logged in users", async () => {
    const response = await supertest(app)
      .get("/logout")
      .expect(Cookies.set({name: "jwt", options: ["max-age"]}));

    expect(response.statusCode).toBe(200);
  });

  it("returns OK and cookie with max-age set when user logged in", async () => {
    const user = await User.findOne({ uniEmail: getEmail() });
    const token = createToken(user._id);
    const response = await supertest(app)
      .get("/logout")
      .set("Cookie", [`jwt=${token}`])
      .expect(Cookies.set({name: "jwt", options: ["max-age"]}));

    expect(response.statusCode).toBe(200);
  });
});