import { render, screen } from "@testing-library/react";
import { waitForElementToBeRemoved } from "@testing-library/react";
import "@testing-library/jest-dom";
import MockComponent from "./utils/MockComponent";
import AuthRoute from "../components/AuthRoute";
import { rest } from "msw";
import { setupServer } from "msw/node";

describe("PrivateRoute Tests", () => {
	const server = setupServer(
		rest.get(`${process.env.REACT_APP_URL}/me`, (req, res, ctx) => {
			return res(
				ctx.json({ message: { firstName: "pac", lastName: "to" }, errors: [] })
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

	async function renderComponent() {
		render(
			<MockComponent>
				<AuthRoute>
					<h1>You are not logged in</h1>
				</AuthRoute>
			</MockComponent>
		);
		await waitForElementToBeRemoved(() => screen.getByText("Loading"));
	}

	it("redirects to /feed if the user is already logged in", async () => {
		await renderComponent();
		expect(window.location.pathname).toBe("/feed");
	});

	it("renders the compontent when the user is not logged in", async () => {
		server.use(
			rest.get(`${process.env.REACT_APP_URL}/me`, (req, res, ctx) => {
				return res(
					ctx.json({ message: null, errors: ["Invalid credentials"] })
				);
			})
		);
		await renderComponent();
		const textElement = screen.getByText("You are not logged in");
		expect(textElement).toBeInTheDocument();
	});
});
