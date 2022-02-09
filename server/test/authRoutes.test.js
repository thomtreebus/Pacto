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
const emailHandler = require('../helpers/emailHandlers');
const { JsonWebTokenError } = require("jsonwebtoken");
const { MESSAGES } = require("../helpers/messages")

jest.mock("../helpers/emailHandlers");
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

// post signup magic values
const REAL_UNI_EMAIL = "aaron.monte@kcl.ac.uk";
const FIRST_NAME = "John";
const LAST_NAME = "Doe";
const PASSWORD = "Password123";


// global helpers and magic values
const TEST_USER_EMAIL = "pac.to@kcl.ac.uk";
const generateTestUser = async () => {
	const uni = await University.create( { name: "kcl", domains: ["kcl.ac.uk"] });

	const salt = await bcrypt.genSalt(SALT_ROUNDS);
	const hashedPassword = await bcrypt.hash("Password123", salt);

	const user = await User.create({
		firstName: "pac",
		lastName: "to",
		uniEmail: TEST_USER_EMAIL,
		password: hashedPassword,
		university: uni
	});

	await uni.users.push(user);
	await uni.save();
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
		await University.deleteMany({});
	});

	describe("POST /login", () => {
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
	
	describe("POST /signup", () => {
		beforeEach(async () => {
			const user = await generateTestUser();
			user.active = true;
			await user.save();
		});

		async function isInvalidCredentials(firstName, lastName, uniEmail, password, msg = INCORRECT_CREDENTIALS, field=null) {
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
			expect(response.body.errors[0].field).toBe(field);
			expect(response.body.errors[0].message).toBe(msg);
			let msgExists= false
			Object.values(response.body.errors).forEach(({message}) =>{
				if(message.includes(msg)){msgExists = true}
			});
			expect(msgExists).toBe(true);
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
			expect(emailHandler.handleVerification).toHaveBeenCalled();
			expect(response.body.message).toBeDefined();
			expect(response.body.errors.length).toBe(0);
		}

		describe("First name validation", () => {
			it("rejects when blank", async () => {
				await isInvalidCredentials(
					"",
					LAST_NAME,
					REAL_UNI_EMAIL,
					PASSWORD,
					MESSAGES.FIRST_NAME.BLANK,
					"firstName"
				);
			});

			it("rejects when it contains numbers", async () => {
				await isInvalidCredentials(
					"123"+FIRST_NAME,
					LAST_NAME,
					REAL_UNI_EMAIL,
					PASSWORD,
					MESSAGES.FIRST_NAME.CONTAINS_NUMBERS,
					"firstName"
				);
			});

			it("rejects if longer than 50 characters", async () => {
				await isInvalidCredentials(
					"x".repeat(51),
					LAST_NAME,
					REAL_UNI_EMAIL,
					PASSWORD,
					MESSAGES.FIRST_NAME.MAX_LENGTH_EXCEEDED,
					"firstName"
				);
			});

			it("accepts if exactly 50 characters", async () => {
				await isValidCredentials(
					"x".repeat(50),
					LAST_NAME,
					REAL_UNI_EMAIL,
					PASSWORD
				);
			});
		})

		describe("Last name validation", () => {
			it("rejects when blank", async () => {
				await isInvalidCredentials(
					FIRST_NAME,
					"",
					REAL_UNI_EMAIL,
					PASSWORD,
					MESSAGES.LAST_NAME.BLANK,
					"lastName"
				);
			});
			it("rejects when it contains numbers", async () => {
				await isInvalidCredentials(
					FIRST_NAME,
					"123"+LAST_NAME,
					REAL_UNI_EMAIL,
					PASSWORD,
					MESSAGES.LAST_NAME.CONTAINS_NUMBERS,
					"lastName"
				);
			});
			it("rejects if longer than 50 characters", async () => {
				await isInvalidCredentials(
					FIRST_NAME,
					"x".repeat(51),
					REAL_UNI_EMAIL,
					PASSWORD,
					MESSAGES.LAST_NAME.MAX_LENGTH_EXCEEDED,
					"lastName"
				);
			});
			it("accepts if exactly 50 characters", async () => {
				await isValidCredentials(
					FIRST_NAME,
					"x".repeat(50),
					REAL_UNI_EMAIL,
					PASSWORD
				);
			});
		});

		describe("University email validation", () => {
			it("rejects when blank", async () => {
				await isInvalidCredentials(
					FIRST_NAME,
					LAST_NAME,
					"",
					PASSWORD,
					MESSAGES.EMAIL.BLANK,
					"uniEmail"
				);
			});

			it("rejects when not a uni-associated email", async () => {
				await isInvalidCredentials(
					FIRST_NAME,
					FIRST_NAME,
					"john.doe@example.com",
					PASSWORD,
					MESSAGES.EMAIL.UNI.NON_UNI_EMAIL,
					"uniEmail"
				);
			});

			it("rejects when invalid email format", async () => {
				await isInvalidCredentials(
					FIRST_NAME,
					LAST_NAME,
					"john.doe",
					PASSWORD,
					MESSAGES.EMAIL.INVALID_FORMAT,
					"uniEmail"
				);
			});

			it("rejects when email not unqiue", async () => {
				await isInvalidCredentials(
					FIRST_NAME,
					LAST_NAME,
					"pac.to@kcl.ac.uk",
					PASSWORD,
					MESSAGES.EMAIL.NOT_UNIQUE,
					"uniEmail"
				);
			})
		});

		it("accepts valid input", async () => {
			await isValidCredentials(
				FIRST_NAME,
				LAST_NAME,
				REAL_UNI_EMAIL,
				PASSWORD,
			);
		});

		it("handles upper case email", async () => {
			await isValidCredentials(
				FIRST_NAME,
				LAST_NAME,
				REAL_UNI_EMAIL.toUpperCase(),
				PASSWORD,
			);
		});

		describe("Password validation", () => {
			it("rejects when blank", async () => {
				await isInvalidCredentials(
					FIRST_NAME,
					LAST_NAME,
					REAL_UNI_EMAIL,
					"",
					MESSAGES.PASSWORD.BLANK,
					"password"
				);
			});

			it("rejects when longer than 64 characters", async () => {
				await isInvalidCredentials(
					FIRST_NAME,
					LAST_NAME,
					REAL_UNI_EMAIL,
					"P1" + "a".repeat(63),
					MESSAGES.PASSWORD.MAX_LENGTH_EXCEEDED,
					"password"
				);
			});

			it("accepts when 64 characters", async () => {
				await isValidCredentials(
					FIRST_NAME,
					LAST_NAME,
					REAL_UNI_EMAIL,
					"P1" + "a".repeat(62)
				);
			});

			it("rejects when below 8 characters", async () => {
				await isInvalidCredentials(
					FIRST_NAME,
					LAST_NAME,
					REAL_UNI_EMAIL,
					"Pass123", // 7 chars
					MESSAGES.PASSWORD.MIN_LENGTH_NOT_MET,
					"password"
				);
			});

			it("accepts when 8 characters", async () => {
				await isValidCredentials(
					FIRST_NAME,
					LAST_NAME,
					REAL_UNI_EMAIL,
					"Passw123" // 8 chars
				);
			});

			it("rejects when does not contain number", async () => {
				await isInvalidCredentials(
					FIRST_NAME,
					LAST_NAME,
					REAL_UNI_EMAIL,
					"Password",
					MESSAGES.PASSWORD.NO_NUMBERS,
					"password"
				);
			});

			it("rejects when does not contain capital letter", async () => {
				await isInvalidCredentials(
					FIRST_NAME,
					LAST_NAME,
					REAL_UNI_EMAIL,
					"passsword123",
					MESSAGES.PASSWORD.NO_UPPERCASE,
					"password"
				);
			});

			it("rejects when does not contain lowercase character", async () => {
				await isInvalidCredentials(
					FIRST_NAME,
					LAST_NAME,
					REAL_UNI_EMAIL,
					"PASSWORD123",
					MESSAGES.PASSWORD.NO_LOWERCASE,
					"password"
				);
			});
		});
	});
});