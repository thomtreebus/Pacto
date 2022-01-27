const supertest = require("supertest");
const app = require("../app");

describe("GET /ping", () => {
	it("replies with pong", async () => {
		const response = await supertest(app).get("/ping");
		expect(response.ping).toBe("pong");
	});
});
