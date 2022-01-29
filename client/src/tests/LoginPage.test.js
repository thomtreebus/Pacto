import { render, screen, fireEvent } from "@testing-library/react";
import Login from "../pages/LoginPage";
import "@testing-library/jest-dom";
import MockComponent from "./utils/MockComponent";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { waitForElementToBeRemoved } from "@testing-library/react";

describe("LoginPage Tests", () => {
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

	beforeEach(async () => {
		render(
			<MockComponent>
				<Login />
			</MockComponent>
		);
		await waitForElementToBeRemoved(() => screen.getByText("Loading"));
	});

	describe("Check elements are rendered", () => {
		it("should render the background image element", async () => {
			const gridElement = await screen.findByTestId("background-login-image");
			expect(gridElement).toHaveStyle(
				"background-image: url(https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80)"
			);
		});

		it("should render the Pacto icon element", async () => {
			const avatarElement = await screen.findByAltText("Pacto Icon");
			expect(avatarElement).toBeInTheDocument();
		});

		it("should render the 'Sign In' header element", async () => {
			const typographyElement = await screen.findByRole("heading", {
				name: "Sign In",
			});
			expect(typographyElement).toBeInTheDocument();
		});

		it("should render the email input element", async () => {
			const inputElement = await screen.findByRole("textbox", {
				name: "Email Address",
			});
			expect(inputElement).toBeInTheDocument();
		});

		it("should render the password input element", async () => {
			const inputElementDiv = await screen.findByTestId("password-input");
			const inputElement = inputElementDiv.querySelector("input");
			expect(inputElement).toBeInTheDocument();
		});

		it("should render the sign in button element", async () => {
			const buttonElement = await screen.findByRole("button", {
				name: "Sign In",
			});
			expect(buttonElement).toBeInTheDocument();
		});

		it("should render the 'Don't have an account? Sign Up' link element", async () => {
			const linkElement = await screen.findByRole("link", {
				name: "Don't have an account? Sign Up",
			});
			expect(linkElement).toBeInTheDocument();
		});
	});

	describe("Check interaction with elements", () => {
		it("should be able to type into email field", async () => {
			const inputElement = await screen.findByRole("textbox", {
				name: "Email Address",
			});
			fireEvent.change(inputElement, { target: { value: "johndoe@kekw.org" } });
			expect(inputElement.value).toBe("johndoe@kekw.org");
		});

		it("should be able to type into password field", async () => {
			const inputElementDiv = await screen.findByTestId("password-input");
			const inputElement = inputElementDiv.querySelector("input");
			fireEvent.change(inputElement, { target: { value: "hunter123" } });
			expect(inputElement.value).toBe("hunter123");
		});

		it("should redirect to sign up if the sign up button is pressed", async () => {
			const linkElement = await screen.findByRole("link", {
				name: "Don't have an account? Sign Up",
			});
			fireEvent.click(linkElement);
			expect(window.location.pathname).toBe("/signup");
		});
	});
});
