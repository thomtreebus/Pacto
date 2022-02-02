import { render, screen } from "@testing-library/react";
import { waitForElementToBeRemoved } from "@testing-library/react";
import "@testing-library/jest-dom";
import MockComponent from "./utils/MockComponent";
import AuthRoute from "../components/AuthRoute";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { useAuth } from "../providers/AuthProvider";

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
				<MockAuthProviderUser />
			</MockComponent>
		);
		await waitForElementToBeRemoved(() => screen.getByText("Loading"));
	}

	it("isAuthenticated is true and user is defined when user is logged in", async () => {
		await renderComponent();
		const textElement = screen.getByText("pac");
		expect(textElement).toBeInTheDocument();
	});

	it("isAuthenticated is false is logged not in", async () => {
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

	it("displays and error is something went wrong", async () => {
		server.use(
			rest.get(`${process.env.REACT_APP_URL}/me`, (req, res, ctx) => {
				return res(ctx.json({ pacto: ":(" }));
			})
		);
		await renderComponent();
		const textElement = screen.getByText(/Error:/i);
		expect(textElement).toBeInTheDocument();
	});
});
