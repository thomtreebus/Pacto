import { render, screen } from "@testing-library/react";
import { waitForElementToBeRemoved } from "@testing-library/react";
import "@testing-library/jest-dom";
import MockComponent from "./utils/MockComponent";
import AuthRoute from "../components/AuthRoute";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { useAuth } from "../providers/AuthProvider";
import { useMockServer } from "./utils/useMockServer";

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
});
