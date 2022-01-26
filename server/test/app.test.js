describe("Actions script", () => {
	it("passes the test", () => {
		console.log(process.env.TEST_DB_CONNECTION_URL);
		expect(true).toBe(true);
	});
});
