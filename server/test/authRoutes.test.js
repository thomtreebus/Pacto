const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");
const EmailVerificationCode = require("../models/EmailVerificationCode");
const supertest = require("supertest");
const bcrypt = require("bcrypt");
const app = require("../app");
var Cookies = require("expect-cookies");

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
}

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

		async function isInvalidCredentials(uniEmail, password, msg=INCORRECT_CREDENTIALS) {
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
			await User.findOneAndUpdate({uniEmail: TEST_USER_EMAIL}, {active: false});
			await isInvalidCredentials("pac.to@kcl.ac.uk", "Password123", INACTIVE_ACCOUNT);
		})
	});

	describe("GET /verify", () => {
		beforeEach(async () => {
			const user = await generateTestUser();
			await EmailVerificationCode.create({
				userId: user._id,
				code: VERIFICATION_CODE
			});
		});

		// Helpers
		async function getVerifyWithCode(code) {
			const response = await supertest(app)
			.get("/verify?code="+code);

			return response;
		}

		async function isResponseUnsuccessful(response, msg=INVALID_CODE) {
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

			const user = await User.findOne({ uniEmail: TEST_USER_EMAIL});
			expect(user.active).toBe(true);
		});

		it("fails to verify inactive user with invalid code", async () => {
			const response = await getVerifyWithCode(VERIFICATION_CODE + "gibberish");
			isResponseUnsuccessful(response);

			const user = await User.findOne({ uniEmail: TEST_USER_EMAIL});
			expect(user.active).toBe(false);
		});

		it("fails to verify inactive user with no code param", async () => {
			const response = await getVerifyWithCode("");
			isResponseUnsuccessful(response, MISSING_CODE)

			const user = await User.findOne({ uniEmail: TEST_USER_EMAIL});
			expect(user.active).toBe(false);
		});

		it("identifies already used code as invalid, with user object not affected", async () => {
			const response = await getVerifyWithCode(VERIFICATION_CODE);
			isResponseSuccessful(response);
			const user = await User.findOne({ uniEmail: TEST_USER_EMAIL});
			expect(user.active).toBe(true);

			const responseAfterSuccess = await getVerifyWithCode(VERIFICATION_CODE);
			isResponseUnsuccessful(responseAfterSuccess);
			expect(user.active).toBe(true);
		});
	});

	describe("POST /signup", () => {
		beforeEach(async () => {
			const user = await generateTestUser();
			user.active = true;
			await user.save();
		});

		async function isInvalidCredentials(firstName, lastName, uniEmail, password, msg = INCORRECT_CREDENTIALS) {
			const response = await supertest(app)
				.post("/signup")
				.send({
					firstName,
					lastName,
					uniEmail,
					password,
				})
				.expect(400);

			expect(response.body.message).toBe(null);
			expect(response.body.errors[0].field).toBe(null);
			expect(response.body.errors[0].message).toBe(msg);
			expect(response.body.errors.length).toBe(1);
		}

		async function isValidCredentials(firstName, lastName, uniEmail, password) {
			const response = await supertest(app)
				.post("/signup")
				.send({
					firstName,
					lastName,
					uniEmail,
					password,
				})
				.expect(201);
			expect(response.body.message).toBeDefined();
			expect(response.body.errors.length).toBe(0);
		}

		describe("reject firstName due to: ", () => {
			it("blank", async () => {
				await isInvalidCredentials(
					"",
					"Smith",
					"kolling.smith@kekw.ac.uk",
					"Password123",
					"Users validation failed: firstName: Provide the first name"
				);
			});
			it("contains numbers", async () => {
				await isInvalidCredentials(
					"123Kolling",
					"Smith",
					"kolling.smith@kekw.ac.uk",
					"Password123",
					"Users validation failed: firstName: Provide firstName without number"
				);
			});
			it("longer than 64", async () => {
				await isInvalidCredentials(
					"Kolling".repeat(300),
					"Smith",
					"kolling.smith@kekw.ac.uk",
					"Password123",
					"Users validation failed: firstName: Provide firstName shorter than 16 characters"
				);
			});

		})

		describe("reject lastName due to: ", () => {
			it("blank", async () => {
				await isInvalidCredentials(
					"Kolling",
					"",
					"kolling.smith@kekw.ac.uk",
					"Password123",
					"Users validation failed: lastName: Provide the last name"
				);
			});
			it("contains numbers", async () => {
				await isInvalidCredentials(
					"Kolling",
					"123Smith",
					"kolling.smith@kekw.ac.uk",
					"Password123",
					"Users validation failed: lastName: Provide lastName without number"
				);
			});
			it("longer than 64", async () => {
				await isInvalidCredentials(
					"Kolling",
					"Smith".repeat(300),
					"kolling.smith@kekw.ac.uk",
					"Password123",
					"Users validation failed: lastName: Provide lastName shorter than 16 characters"
				);
			});
		})
		describe("reject incorrect email due to: ", () => {
			it(" blank email", async () => {
				await isInvalidCredentials(
					"Kolling",
					"Smith",
					"",
					"Password123",
					"Users validation failed: uniEmail: Provide the email"
				);
			});
			it("non uni email", async () => {
				await isInvalidCredentials(
					"Kolling",
					"Kolling",
					"kolling.smith@example.com",
					"Password123",
					"Users validation failed: uniEmail: Provide a uni email"
				);
			});
			it("invalid email format", async () => {
				await isInvalidCredentials(
					"Kolling",
					"Smith",
					"kolling.smith",
					"Password123",
					"Users validation failed: uniEmail: Provide a valid email format"
				);
			});
			it("email exists", async () => {
				await isInvalidCredentials(
					"Kolling",
					"Smith",
					"pac.to@kcl.ac.uk",
					"Password123",
					"Email already exists"
				);
			});
			it("emails contains uppercase", async () => {
				await isInvalidCredentials(
					"Kolling",
					"Smith",
					"kolling.Smith@kekw.ac.uk",
					"Password123",
					"Users validation failed: uniEmail: Provide lowercase email"
				);
			});
		});
		it("accepts valid input", async () => {
			await isValidCredentials(
				"Kolling",
				"Smith",
				"kolling.smith@kekw.ac.uk",
				"Password123",
			);
		});
		describe("reject password due to: ", () => {
			it("blank password", async () => {
				await isInvalidCredentials(
					"Kolling",
					"Smith",
					"kolling.smith@kekw.ac.uk",
					"",
					"Password does not meet requirements"
				);
			});

			it("password too long", async () => {
				await isInvalidCredentials(
					"Kolling",
					"Smith",
					"kolling.smith@kekw.ac.uk",
					"a".repeat(3000),
					"Password does not meet requirements"
				);
			});
		})
	});



});
