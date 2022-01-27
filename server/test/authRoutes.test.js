const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");
const EmailVerificationCode = require("../models/EmailVerificationCode");
const supertest = require("supertest");
const bcrypt = require("bcrypt");
const app = require("../app");
var Cookies = require("expect-cookies");
const { findOne } = require("../models/User");

dotenv.config();

// post login magic values
const SALT_ROUNDS = 10;
const INCORRECT_CREDENTIALS = "Incorrect credentials.";
const INACTIVE_ACCOUNT = "University email not yet verified.";

// get verify magic values
const VERIFICATION_CODE = "kaushik12";

const generateTestUser = async () => {
	const salt = await bcrypt.genSalt(SALT_ROUNDS);
			const hashedPassword = await bcrypt.hash("Password123", salt);
			const user = await User.create({
				firstName: "pac",
				lastName: "to",
				uniEmail: "pac.to@kcl.ac.uk",
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
	});

	describe("POST /login", () => {
		beforeEach(async () => {
			const user = await generateTestUser();
			user.active = true;
			await user.save();
		});

		async function isInvalidCredntials(uniEmail, password, msg=INCORRECT_CREDENTIALS) {
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

		async function isValidCredntials(uniEmail, password) {
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

		it("rejects invalid email", async () => {
			await isInvalidCredntials("pac.to", "Password123");
		});

		it("rejects incorrect email", async () => {
			await isInvalidCredntials("pac.to1@kcl.ac.uk", "Password123");
		});

		it("rejects invalid password", async () => {
			await isInvalidCredntials("pac.to@kcl.ac.uk", "Password1");
		});

		it("rejects invalid email and password", async () => {
			await isInvalidCredntials("pac.to1@kcl.ac.uk", "Password1");
		});

		it("logs the user in when the credentials are correct", async () => {
			await isValidCredntials("pac.to@kcl.ac.uk", "Password123");
		});

		it("rejects inactive user with correct credentials", async () => {
			await User.findOneAndUpdate({uniEmail: 'pac.to@kcl.ac.uk'}, {active: false});
			await isInvalidCredntials("pac.to@kcl.ac.uk", "Password123", INACTIVE_ACCOUNT);
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

		async function getVerifyWithCode(code) {
			const response = await supertest(app)
			.get("/verify?code="+VERIFICATION_CODE);

			return response;
		}

		it("verify inactive user with valid code", async () => {
			const response = await getVerifyWithCode(VERIFICATION_CODE);
			const user = await User.findOne({ uniEmail: "pac.to@kcl.ac.uk"});
			expect(response.statusCode).toBe(200);
			expect(user.active).toBe(true);
		})
	});
});
