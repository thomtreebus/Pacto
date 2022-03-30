/**
 * A helper file to isolate the creation of the server and other server
 * related clean up.
 */

import { rest } from "msw";
import { setupServer } from "msw/node";
import testUsers from "./testUsers";

/**
 * A test hook that can be simply be called inside of describe statement. 
 * It handles the creation of a default /me route usign user[0] from test users
 * as well clean up after every single test.
 * 
 * @returns Returns the default configured server. Can be overriden with .use()
 * but the overriding is reset on every test put the overriding in beforeEach()
 * to acheieve a permanant override effect.
 */
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

	return server;
};
