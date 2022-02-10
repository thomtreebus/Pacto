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

// get verify magic values
const VERIFICATION_CODE = "kaushik12";
const MISSING_CODE = "Code query empty.";
const INVALID_CODE = "Invalid or expired code.";
const VERIFY_SUCCESS_RESPONSE_TEXT = "Success! You may now close this page."; // recall this is a special case


describe("Authentication routes", () => {
	beforeAll(async () => {
		await mongoose.connect(process.env.TEST_DB_CONNECTION_URL);
	});

	afterAll(async () => {
		await mongoose.connection.close();
	});

	afterEach(async () => {
		await User.deleteMany({});
		await EmailVerificationCode.deleteMany({});
		await University.deleteMany({});
	});

	

	describe("GET /verify", () => {
		beforeEach(async () => {
			const user = await generateTestUser();
			await EmailVerificationCode.create({
				userId: user._id,
				code: VERIFICATION_CODE,
			});
		});

		// Helpers
		async function getVerifyWithCode(code) {
			const response = await supertest(app).get("/verify?code=" + code);

			return response;
		}

		async function isResponseUnsuccessful(response, msg = INVALID_CODE) {
			expect(response.statusCode).toBe(400);
			expect(response.body.errors.length).toBe(1);
			expect(response.body.errors[0].message).toBe(msg);
		}

		async function isResponseSuccessful(response) {
			expect(response.statusCode).toBe(200);
			expect(response.text).toBe(VERIFY_SUCCESS_RESPONSE_TEXT);
		}

		// Tests
		it("verifies inactive user with valid code", async () => {
			const response = await getVerifyWithCode(VERIFICATION_CODE);
			isResponseSuccessful(response);

			const user = await User.findOne({ uniEmail: TEST_USER_EMAIL });
			expect(user.active).toBe(true);
		});

		it("fails to verify inactive user with invalid code", async () => {
			const response = await getVerifyWithCode(VERIFICATION_CODE + "gibberish");
			isResponseUnsuccessful(response);

			const user = await User.findOne({ uniEmail: TEST_USER_EMAIL });
			expect(user.active).toBe(false);
		});

		it("fails to verify inactive user with no code param", async () => {
			const response = await getVerifyWithCode("");
			isResponseUnsuccessful(response, MISSING_CODE);

			const user = await User.findOne({ uniEmail: TEST_USER_EMAIL });
			expect(user.active).toBe(false);
		});

		it("identifies already used code as invalid, with user object not affected", async () => {
			const response = await getVerifyWithCode(VERIFICATION_CODE);
			isResponseSuccessful(response);
			const user = await User.findOne({ uniEmail: TEST_USER_EMAIL });
			expect(user.active).toBe(true);

			const responseAfterSuccess = await getVerifyWithCode(VERIFICATION_CODE);
			isResponseUnsuccessful(responseAfterSuccess);
			expect(user.active).toBe(true);
		});
	});

	describe("GET /me", () => {
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
});