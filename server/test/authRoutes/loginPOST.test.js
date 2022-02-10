const mongoose = require("mongoose");
const dotenv = require("dotenv");
const supertest = require("supertest");
const app = require("../../app");
const Cookies = require("expect-cookies");
const { createToken } = require("../../controllers/authController");
const User = require("../../models/User");
const University = require("../../models/University");
const { generateTestUser } = require('../fixtures/generateTestUser');

// post login magic values
const INCORRECT_CREDENTIALS = "Incorrect credentials.";
const INACTIVE_ACCOUNT = "University email not yet verified.";

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

  async function isInvalidCredentials(uniEmail, password,	msg = INCORRECT_CREDENTIALS) {
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

  // Not using TEST_USER_EMAIL due to nature of these tests.
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
      { uniEmail: TEST_USER_EMAIL },
      { active: false }
    );
    await isInvalidCredentials(
      "pac.to@kcl.ac.uk",
      "Password123",
      INACTIVE_ACCOUNT
    );
  });
});

describe("GET /logout", () => {
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
    const user = await User.findOne({ uniEmail: TEST_USER_EMAIL });
    const token = createToken(user._id);
    const response = await supertest(app)
      .get("/logout")
      .set("Cookie", [`jwt=${token}`])
      .expect(Cookies.set({name: "jwt", options: ["max-age"]}));

    expect(response.statusCode).toBe(200);
  });
});