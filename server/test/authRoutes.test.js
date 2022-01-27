const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");
const EmailVerificationCode = require("../models/EmailVerificationCode");
const supertest = require("supertest");
const bcrypt = require("bcrypt");
const app = require("../app");
var Cookies = require("expect-cookies");
const { createToken } = require("../controllers/authController");

dotenv.config();

// post login magic values
const SALT_ROUNDS = 10;
const INCORRECT_CREDENTIALS = "Incorrect credentials.";
const INACTIVE_ACCOUNT = "University email not yet verified.";

// get verify magic values
const VERIFICATION_CODE = "kaushik12";
const MISSING_CODE = "Code query empty.";
const INVALID_CODE = "Invalid or expired code.";
const VERIFY_SUCCESS_RESPONSE_TEXT = "Success! You may now close this page."; // recall this is a special case

// global helpers and magic values
const TEST_USER_EMAIL = "pac.to@kcl.ac.uk";
const generateTestUser = async () => {
	const salt = await bcrypt.genSalt(SALT_ROUNDS);
	const hashedPassword = await bcrypt.hash("Password123", salt);
	const user = await User.create({
		firstName: "pac",
		lastName: "to",
		uniEmail: TEST_USER_EMAIL,
		password: hashedPassword,
	});
	return user;
};

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
	});

	describe("POST /login", () => {
		beforeEach(async () => {
			const user = await generateTestUser();
			user.active = true;
			await user.save();
		});

		async function isInvalidCredentials(
			uniEmail,
			password,
			msg = INCORRECT_CREDENTIALS
		) {
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
			const password = "Password123";
			const salt = await bcrypt.genSalt(SALT_ROUNDS);
			const hashedPassword = await bcrypt.hash(password, salt);

			const user = await User.create({
				firstName: "pac",
				lastName: "to",
				uniEmail: "pac.to@kcl.ac.uk",
				password: hashedPassword,
			});

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

		it("returns an error when not  logged in", async () => {
			const password = "Password123";
			const salt = await bcrypt.genSalt(SALT_ROUNDS);
			const hashedPassword = await bcrypt.hash(password, salt);

			const user = await User.create({
				firstName: "pac",
				lastName: "to",
				uniEmail: "pac.to@kcl.ac.uk",
				password: hashedPassword,
			});

			const token = createToken(user._id);

			let response = await supertest(app)
				.get("/me")
				.set("Cookie", [`jwt=${token}`])
				.expect(200);
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
