const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");
const supertest = require("supertest");
const bcrypt = require("bcrypt");
const app = require("../app");
var Cookies = require("expect-cookies");

dotenv.config();

describe("Middlewares", () => {
	beforeAll(async () => {
		await mongoose.connect(process.env.TEST_DB_CONNECTION_URL);
	});

	afterAll(async () => {
		await mongoose.connection.close();
	});

	afterEach(async () => {
		await User.deleteMany({});
	});

    describe("Authentification Middleware", () => {
		beforeEach(async () => {
			// Create a test user
			const salt = await bcrypt.genSalt(SALT_ROUNDS);
			const hashedPassword = await bcrypt.hash("Password123", salt);
			const user = await User.create({
				firstName: "pac",
				lastName: "to",
				uniEmail: "pac.to@kcl.ac.uk",
				password: hashedPassword,
			});
            // Loging in
            const response = await supertest(app)
				.post("/login")
				.send({
					uniEmail,
					password,
				})
		});

		it("rejects unauthorised access", async () => {
			
		});

        it("accepts authorised access", async () => {
			await isInvalidCredntials("pac.to", "Password123");
		});
	});
});
