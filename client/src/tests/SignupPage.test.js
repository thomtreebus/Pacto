import Signup from "../pages/SignupPage";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { waitForElementToBeRemoved } from "@testing-library/react";
import "@testing-library/jest-dom";
import MockComponent from "./utils/MockComponent";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { Route } from "react-router-dom";
import users from "./utils/testUsers";

describe("SignupPage Tests", () => {
	const server = setupServer(
		rest.get(`${process.env.REACT_APP_URL}/me`, (req, res, ctx) => {
			return res(ctx.json({ message: users[0], errors: [] }));
		}),
		rest.post(`${process.env.REACT_APP_URL}/signup`, (req, res, ctx) => {
			return res(
				ctx.status(401),
				ctx.json({
					message: null,
					errors: [
						{ field: null, message: "The details entered are invalid." },
					],
				})
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
				<Signup />
				<Route exact path="/login">
					<h1>Redirected to login</h1>
				</Route>
			</MockComponent>
		);
		await waitForElementToBeRemoved(() => screen.getByText("Loading"));
	});

	describe("Check elements are rendered", () => {
		it("should render the Pacto icon element", async () => {
			const avatarElement = await screen.findByAltText("Pacto Icon");
			expect(avatarElement).toBeInTheDocument();
		});

		it("should render the 'Join Pacto!' header element", async () => {
			const typographyElement = await screen.findByRole("heading", {
				name: "Join Pacto!",
			});
			expect(typographyElement).toBeInTheDocument();
		});

		it("should render the first name input element", async () => {
			const inputElement = await screen.findByRole("textbox", {
				name: "First Name",
			});
			expect(inputElement).toBeInTheDocument();
		});

		it("should render the last name input element", async () => {
			const inputElement = await screen.findByRole("textbox", {
				name: "Last Name",
			});
			expect(inputElement).toBeInTheDocument();
		});

		it("should render the email input element", async () => {
			const inputElement = await screen.findByRole("textbox", {
				name: "University Email Address",
			});
			expect(inputElement).toBeInTheDocument();
		});

		it("should render the password input element", async () => {
			const inputElementDiv = await screen.findByTestId(
				"initial-password-input"
			);
			const inputElement = inputElementDiv.querySelector("input");
			expect(inputElement).toBeInTheDocument();
		});

		it("should render the confirm password input element", async () => {
			const inputElementDiv = await screen.findByTestId(
				"confirm-password-input"
			);
			const inputElement = inputElementDiv.querySelector("input");
			expect(inputElement).toBeInTheDocument();
		});

		it("should render the sign up button element", async () => {
			const buttonElement = await screen.findByRole("button", {
				name: "Sign Up",
			});
			expect(buttonElement).toBeInTheDocument();
		});

		it("should render the 'Already have an account? Sign in' link element", async () => {
			const linkElement = await screen.findByRole("link", {
				name: "Already have an account? Sign in",
			});
			expect(linkElement).toBeInTheDocument();
		});
	});

	describe("Check interaction with elements", () => {
		it("should be able to type into first name field", async () => {
			const inputElement = await screen.findByRole("textbox", {
				name: "First Name",
			});
			fireEvent.change(inputElement, { target: { value: "John" } });
			expect(inputElement.value).toBe("John");
		});

		it("should be able to type into last name field", async () => {
			const inputElement = await screen.findByRole("textbox", {
				name: "Last Name",
			});
			fireEvent.change(inputElement, { target: { value: "Doe" } });
			expect(inputElement.value).toBe("Doe");
		});

		it("should be able to type into email field", async () => {
			const inputElement = await screen.findByRole("textbox", {
				name: "University Email Address",
			});
			fireEvent.change(inputElement, {
				target: { value: "johndoe@uni.ac.uk" },
			});
			expect(inputElement.value).toBe("johndoe@uni.ac.uk");
		});

		it("should be able to type into password field", async () => {
			const inputElementDiv = await screen.findByTestId(
				"initial-password-input"
			);
			const inputElement = inputElementDiv.querySelector("input");
			fireEvent.change(inputElement, { target: { value: "Password123" } });
			expect(inputElement.value).toBe("Password123");
		});

		it("should be able to type into confirm password field", async () => {
			const inputElementDiv = await screen.findByTestId(
				"confirm-password-input"
			);
			const inputElement = inputElementDiv.querySelector("input");
			fireEvent.change(inputElement, { target: { value: "Password123" } });
			expect(inputElement.value).toBe("Password123");
		});

		it("should return error when invalid first name is entered when the signup button is pressed with invalid credentials", async () => {
			server.use(
				rest.post(`${process.env.REACT_APP_URL}/signup`, (req, res, ctx) => {
					return res(
						ctx.json({
							message: null,
							errors: [
								{ field: "firstName", message: "Provide the first name" },
							],
						})
					);
				})
			);
			const nonExistingElement = screen.queryByText("Provide the first name");
			expect(nonExistingElement).not.toBeInTheDocument();
			const buttonElement = await screen.findByRole("button", {
				name: "Sign Up",
			});
			fireEvent.click(buttonElement);
			const firstNameElement = await screen.findByText(
				"Provide the first name"
			);
			expect(firstNameElement).toBeInTheDocument();
		});

		it("should return error when invalid last name is entered when the signup button is pressed with invalid credentials", async () => {
			server.use(
				rest.post(`${process.env.REACT_APP_URL}/signup`, (req, res, ctx) => {
					return res(
						ctx.json({
							message: null,
							errors: [{ field: "lastName", message: "Provide the last name" }],
						})
					);
				})
			);
			const nonExistingElement = screen.queryByText("Provide the last name");
			expect(nonExistingElement).not.toBeInTheDocument();
			const buttonElement = await screen.findByRole("button", {
				name: "Sign Up",
			});
			fireEvent.click(buttonElement);
			const lastNameElement = await screen.findByText("Provide the last name");
			expect(lastNameElement).toBeInTheDocument();
		});

		it("should return error when invalid email is entered when the signup button is pressed with invalid credentials", async () => {
			server.use(
				rest.post(`${process.env.REACT_APP_URL}/signup`, (req, res, ctx) => {
					return res(
						ctx.json({
							message: null,
							errors: [{ field: "uniEmail", message: "Provide the email" }],
						})
					);
				})
			);
			const nonExistingElement = screen.queryByText("Provide the email");
			expect(nonExistingElement).not.toBeInTheDocument();
			const buttonElement = await screen.findByRole("button", {
				name: "Sign Up",
			});
			fireEvent.click(buttonElement);
			const emailElement = await screen.findByText("Provide the email");
			expect(emailElement).toBeInTheDocument();
		});

		it("should return error when invalid password is entered when the signup button is pressed with invalid credentials", async () => {
			server.use(
				rest.post(`${process.env.REACT_APP_URL}/signup`, (req, res, ctx) => {
					return res(
						ctx.json({
							message: null,
							errors: [
								{
									field: "password",
									message: "Password does not meet requirements",
								},
							],
						})
					);
				})
			);
			const nonExistingElement = screen.queryByText(
				"Password does not meet requirements"
			);
			expect(nonExistingElement).not.toBeInTheDocument();
			const buttonElement = await screen.findByRole("button", {
				name: "Sign Up",
			});
			fireEvent.click(buttonElement);
			const passwordElement = await screen.findByText(
				"Password does not meet requirements"
			);
			expect(passwordElement).toBeInTheDocument();
		});

		it("hould return error when password does not match confirm password when the signup button is pressed with invalid credentials", async () => {
			const initialPassword = await screen.findByTestId(
				"initial-password-input"
			);
			const initialPasswordInput = initialPassword.querySelector("input");
			fireEvent.change(initialPasswordInput, {
				target: { value: "Password123" },
			});
			const confirmPassword = await screen.findByTestId(
				"confirm-password-input"
			);
			const confirmPasswordInput = confirmPassword.querySelector("input");
			fireEvent.change(confirmPasswordInput, {
				target: { value: "password1" },
			});
			const nonExistingElement = screen.queryByText("Passwords do not match!");
			expect(nonExistingElement).not.toBeInTheDocument();
			const buttonElement = await screen.findByRole("button", {
				name: "Sign Up",
			});
			fireEvent.click(buttonElement);
			const passwordElement = await screen.findByText(
				"Passwords do not match!"
			);
			expect(passwordElement).toBeInTheDocument();
		});

		it("should return multiple errors when multiple fields are entered when the signup button is pressed with invalid credentials", async () => {
			server.use(
				rest.post(`${process.env.REACT_APP_URL}/signup`, (req, res, ctx) => {
					return res(
						ctx.json({
							message: null,
							errors: [
								{ field: "firstName", message: "Provide the first name" },
								{ field: "lastName", message: "Provide the last name" },
							],
						})
					);
				})
			);
			const nonExistingFirstNameElement = screen.queryByText(
				"Provide the first name"
			);
			const nonExistingLastNameElement = screen.queryByText(
				"Provide the last name"
			);
			expect(nonExistingFirstNameElement).not.toBeInTheDocument();
			expect(nonExistingLastNameElement).not.toBeInTheDocument();
			const buttonElement = await screen.findByRole("button", {
				name: "Sign Up",
			});
			fireEvent.click(buttonElement);
			const firstNameElement = await screen.findByText(
				"Provide the first name"
			);
			const lastNameElement = await screen.findByText("Provide the last name");
			expect(firstNameElement).toBeInTheDocument();
			expect(lastNameElement).toBeInTheDocument();
		});

		it("should redirect to login when the sign up button is pressed with valid credentials", async () => {
			server.use(
				rest.post(`${process.env.REACT_APP_URL}/signup`, (req, res, ctx) => {
					return res(
						ctx.status(201),
						ctx.json({
							message: "Success",
							errors: [],
						})
					);
				})
			);
			const buttonElement = await screen.findByRole("button", {
				name: "Sign Up",
			});
			fireEvent.click(buttonElement);
			await waitFor(() => expect(window.location.pathname).toBe("/login"));
		});

		it("should redirect to sign in if the sign in button is pressed", async () => {
			const linkElement = await screen.findByRole("link", {
				name: "Already have an account? Sign in",
			});
			fireEvent.click(linkElement);
			expect(window.location.pathname).toBe("/login");
		});
	});
});
