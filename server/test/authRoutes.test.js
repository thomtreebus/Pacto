const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");
const supertest = require("supertest");
const bcrypt = require("bcrypt");
const app = require("../app");
const { use } = require("../routes/auth");
var Cookies = require("expect-cookies");

dotenv.config();

const SALT_ROUNDS = 10;

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
			// Create a test user
			const salt = await bcrypt.genSalt(SALT_ROUNDS);
			const hashedPassword = await bcrypt.hash("password", salt);
			const user = await User.create({
				firstName: "pac",
				lastName: "to",
				uniEmail: "pac.to@kcl.ac.uk",
				password: hashedPassword,
			});
		});

		async function isInvalidCredntials(uniEmail, password) {
			const response = await supertest(app)
				.post("/login")
				.send({
					uniEmail,
					password,
				})
				.expect(400);

			expect(response.body.message).toBe(null);
			expect(response.body.errors[0].field).toBe(null);
			expect(response.body.errors[0].message).toBe("Incorrect credentials!");
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
			await isInvalidCredntials("pac.to", "password");
		});

		it("rejects incorrect email", async () => {
			await isInvalidCredntials("pac.to1@kcl.ac.uk", "password");
		});

		it("rejects invalid password", async () => {
			await isInvalidCredntials("pac.to@kcl.ac.uk", "password1");
		});

		it("rejects invalid email and password", async () => {
			await isInvalidCredntials("pac.to1@kcl.ac.uk", "password1");
		});

		it("logs the user in when the credentials are correct", async () => {
			await isValidCredntials("pac.to@kcl.ac.uk", "password");
		});
	});
});
