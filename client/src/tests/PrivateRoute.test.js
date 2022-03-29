import { render, screen } from "@testing-library/react";
import { waitForElementToBeRemoved } from "@testing-library/react";
import "@testing-library/jest-dom";
import MockComponent from "./utils/MockComponent";
import PrivateRoute from "../components/PrivateRoute";
import { rest } from "msw";
import { useMockServer } from "./utils/useMockServer";

describe("PrivateRoute Tests", () => {
	const server = useMockServer();

	async function renderComponent() {
		render(
			<MockComponent>
				<PrivateRoute>
					<h1>You are logged in</h1>
				</PrivateRoute>
			</MockComponent>
		);
		await waitForElementToBeRemoved(() => screen.getByText("Loading"));
	}

	it("renders the component when the user is logged in", async () => {
		await renderComponent();
		const textElement = screen.getByText("You are logged in");
		expect(textElement).toBeInTheDocument();
	});

	it("redirects to /login when the user is not logged in", async () => {
		server.use(
			rest.get(`${process.env.REACT_APP_URL}/me`, (req, res, ctx) => {
				return res(
					ctx.status(401),
					ctx.json({ message: null, errors: ["Invalid credentials"] })
				);
			})
		);
		await renderComponent();
		expect(window.location.pathname).toBe("/login");
	});
});
