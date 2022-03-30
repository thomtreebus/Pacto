/**
 * Tests for the context provider AuthProvider. 
 */

import { screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { rest } from "msw";
import { useAuth } from "../providers/AuthProvider";
import { useMockServer } from "./utils/useMockServer";
import mockRender from "./utils/mockRender";

const MockAuthProviderUser = () => {
	const { user, isAuthenticated } = useAuth();

	if (isAuthenticated) {
		return (
			<>
				<h1>{user.firstName}</h1>
			</>
		);
	}

	return <h1>You are not logged in</h1>;
};

describe("AuthProvider Tests", () => {
	const server = useMockServer();

	const renderComponent = async () => await mockRender(<MockAuthProviderUser />)

	it("isAuthenticated is true and user is defined when user is logged in", async () => {
		await renderComponent();
		const textElement = screen.getByText(/pac/i);
		expect(textElement).toBeInTheDocument();
	});

	it("isAuthenticated is false is logged not in", async () => {
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

	it("displays and error is something went wrong with the request", async () => {
		server.use(
			rest.get(`${process.env.REACT_APP_URL}/me`, (req, res, ctx) => {
				return res(ctx.text());
			})
		);
		await renderComponent();
		const textElement = screen.getByText(/Error:/i);
		expect(textElement).toBeInTheDocument();
	});
});
