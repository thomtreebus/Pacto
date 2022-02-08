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
let { handleVerification } = require('../helpers/emailHandlers');
handleVerification = jest.fn(); // Mock

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
const NON_UNI_EMAIL_MESSAGE = "Email not associated with a UK university";
const INVALID_PASSWORD_MESSAGE = "Password does not meet requirements";
const FIRST_NAME = "John";
const LAST_NAME = "Doe";
const PASSWORD = "Password123"


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
			expect(handleVerification).toHaveBeenCalled();
			expect(response.body.message).toBeDefined();
			expect(response.body.errors.length).toBe(0);
		}

		describe("reject firstName due to: ", () => {
			it("blank", async () => {
				await isInvalidCredentials(
					"",
					LAST_NAME,
					REAL_UNI_EMAIL,
					PASSWORD,
					"Provide the first name",
					"firstName"
				);
			});
			it("contains numbers", async () => {
				await isInvalidCredentials(
					"123"+FIRST_NAME,
					LAST_NAME,
					REAL_UNI_EMAIL,
					PASSWORD,
					"Provide firstName without number",
					"firstName"
				);
			});
			it("longer than 64 characters", async () => {
				await isInvalidCredentials(
					FIRST_NAME.repeat(300),
					LAST_NAME,
					REAL_UNI_EMAIL,
					PASSWORD,
					"Provide firstName shorter than 16 characters",
					"firstName"
				);
			});

		})

		describe("reject lastName due to: ", () => {
			it("blank", async () => {
				await isInvalidCredentials(
					FIRST_NAME,
					"",
					REAL_UNI_EMAIL,
					PASSWORD,
					"Provide the last name",
					"lastName"
				);
			});

			it("contains numbers", async () => {
				await isInvalidCredentials(
					FIRST_NAME,
					"123"+LAST_NAME,
					REAL_UNI_EMAIL,
					PASSWORD,
					"Provide lastName without number",
					"lastName"
				);
			});

			it("longer than 64 characters", async () => {
				await isInvalidCredentials(
					FIRST_NAME,
					LAST_NAME.repeat(300),
					REAL_UNI_EMAIL,
					PASSWORD,
					"Provide lastName shorter than 16 characters",
					"lastName"
				);
			});
		});

		describe("reject incorrect email as: ", () => {
			it("email is blank", async () => {
				await isInvalidCredentials(
					FIRST_NAME,
					LAST_NAME,
					"",
					"Password123",
					NON_UNI_EMAIL_MESSAGE,
					"uniEmail"
				);
			});

			it("non uni email", async () => {
				await isInvalidCredentials(
					FIRST_NAME,
					FIRST_NAME,
					"john.doe@example.com",
					PASSWORD,
					NON_UNI_EMAIL_MESSAGE,
					"uniEmail"
				);
			});

			it("invalid email format", async () => {
				await isInvalidCredentials(
					FIRST_NAME,
					LAST_NAME,
					"john.doe",
					PASSWORD,
					NON_UNI_EMAIL_MESSAGE,
					"uniEmail"
				);
			});

			it("email not unqiue", async () => {
				await isInvalidCredentials(
					FIRST_NAME,
					LAST_NAME,
					"pac.to@kcl.ac.uk",
					PASSWORD,
					"Email already exists",
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

		it("handles upper case", async () => {
			await isValidCredentials(
				FIRST_NAME,
				LAST_NAME,
				REAL_UNI_EMAIL.toUpperCase(),
				"Password123",
			);
		});

		describe("reject password due to: ", () => {
			it("blank password", async () => {
				await isInvalidCredentials(
					FIRST_NAME,
					LAST_NAME,
					REAL_UNI_EMAIL,
					"",
					INVALID_PASSWORD_MESSAGE,
					"password"
				);
			});

			it("password too long", async () => {
				await isInvalidCredentials(
					FIRST_NAME,
					LAST_NAME,
					REAL_UNI_EMAIL,
					"a".repeat(3000),
					INVALID_PASSWORD_MESSAGE,
					"password"
				);
			});

			it("password too short", async () => {
				await isInvalidCredentials(
					FIRST_NAME,
					LAST_NAME,
					REAL_UNI_EMAIL,
					"a".repeat(4),
					INVALID_PASSWORD_MESSAGE,
					"password"
				);
			});

			it("password does not contain number", async () => {
				await isInvalidCredentials(
					FIRST_NAME,
					LAST_NAME,
					REAL_UNI_EMAIL,
					"Password",
					INVALID_PASSWORD_MESSAGE,
					"password"
				);
			});

			it("password does not contain capital letter", async () => {
				await isInvalidCredentials(
					FIRST_NAME,
					LAST_NAME,
					REAL_UNI_EMAIL,
					"passsword123",
					INVALID_PASSWORD_MESSAGE,
					"password"
				);
			});

			it("password does not contain lower case character", async () => {
				await isInvalidCredentials(
					FIRST_NAME,
					LAST_NAME,
					REAL_UNI_EMAIL,
					"PASSWORD123",
					INVALID_PASSWORD_MESSAGE,
					"password"
				);
			});

			it("password does not contain number", async () => {
				await isInvalidCredentials(
					FIRST_NAME,
					LAST_NAME,
					REAL_UNI_EMAIL,
					"Password",
					INVALID_PASSWORD_MESSAGE,
					"password"
				);
			});
		});
	});
});