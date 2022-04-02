/**
 * Tests for the auth route.
 */

import { screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import AuthRoute from "../components/AuthRoute";
import { rest } from "msw";
import { useMockServer } from "./utils/useMockServer";
import mockRender from "./utils/mockRender";

describe("AuthRoute Tests", () => {
	let history;
	const server = useMockServer();

	const renderComponent = async () => history = await mockRender(<AuthRoute><h1>You are not logged in</h1></AuthRoute>) 
	
	it("redirects to /feed if the user is already logged in", async () => {
		await renderComponent();
		expect(history.location.pathname).toBe("/feed");
	});

	it("renders the component when the user is not logged in", async () => {
		server.use(
			rest.get(`${process.env.REACT_APP_URL}/me`, (req, res, ctx) => {
				return res(
					ctx.status(401),
					ctx.json({ message: null, errors: ["Invalid credentials"] })
				);
			})
		);
		await renderComponent();
		const textElement = screen.getByText("You are not logged in");
		expect(textElement).toBeInTheDocument();
	});
});
