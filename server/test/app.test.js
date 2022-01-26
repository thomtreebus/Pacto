const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

describe("Actions script", () => {
	beforeAll(async () => {
		await mongoose.connect(process.env.TEST_DB_CONNECTION_URL);
	});

	afterAll(async () => {
		await mongoose.connection.close();
	});

	afterEach(async () => {
		// Empty the database after each test
		// await ModelName.deleteMany({});
	});

	it("passes the test", () => {
		expect(true).toBe(true);
	});
});
