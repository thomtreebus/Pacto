import { rest } from "msw";
import { setupServer } from "msw/node";
import testUsers from "./testUsers";

export const useMockServer = () => {
	const server = setupServer(
		rest.get(`${process.env.REACT_APP_URL}/me`, (req, res, ctx) => {
			return res(
				ctx.status(200),
				ctx.json({ message: testUsers[0], errors: [] })
			);
		})
	);

	beforeAll(() => {
		server.listen();
	});

	afterAll(() => {
		server.close();
	});

	beforeEach(async () => {
		server.resetHandlers();
	});

	return { server };
};
