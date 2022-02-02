import Signup from "../pages/SignupPage";
import { render, screen, fireEvent } from "@testing-library/react";
import { waitForElementToBeRemoved } from "@testing-library/react";
import "@testing-library/jest-dom";
import MockComponent from "./utils/MockComponent";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { Route } from "react-router-dom";

describe("SignupPage Tests", () => {
	const server = setupServer(
		rest.get(`${process.env.REACT_APP_URL}/me`, (req, res, ctx) => {
			return res(
				ctx.json({ message: { firstName: "pac", lastName: "to" }, errors: [] })
			);
		}),
		rest.post(`${process.env.REACT_APP_URL}/signup`, (req, res, ctx) => {
			return res(
				ctx.status(401),
				ctx.json({
					message: null,
					errors: [{ field: null, message: "The details entered are invalid." }],
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
				<Route exact path="/feed">
					<h1>Redirected to feed</h1>
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
			const inputElementDiv = await screen.findByTestId("initial-password-input");
			const inputElement = inputElementDiv.querySelector("input");
			expect(inputElement).toBeInTheDocument();
		});

		it("should render the confirm password input element", async () => {		
			const inputElementDiv = await screen.findByTestId("confirm-password-input");
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
			fireEvent.change(inputElement, { target: { value: "johndoe@uni.ac.uk" } });
			expect(inputElement.value).toBe("johndoe@uni.ac.uk");
		});

		it("should be able to type into password field", async () => {		
			const inputElementDiv = await screen.findByTestId("initial-password-input");
			const inputElement = inputElementDiv.querySelector("input");
			fireEvent.change(inputElement, { target: { value: "Password123" } });
			expect(inputElement.value).toBe("Password123");
		});

		it("should be able to type into confirm password field", async () => {
			const inputElementDiv = await screen.findByTestId("confirm-password-input");
			const inputElement = inputElementDiv.querySelector("input");
			fireEvent.change(inputElement, { target: { value: "Password123" } });
			expect(inputElement.value).toBe("Password123");
		});

		it("should redirect to sign in if the sign in button is pressed", async () => {		
			const linkElement = await screen.findByRole("link", { 
				name: "Already have an account? Sign in", 
			});
			fireEvent.click(linkElement);
			expect(window.location.pathname).toBe("/login");
		});

		it("should return success when valid first name is entered", async () => {
			server.use(
				rest.post(`${process.env.REACT_APP_URL}/signup`, (req, res, ctx) => {
					const { firstName } = req.body;
					if (firstName !== 'Pac') {
						return res(
							ctx.status(401), 
							ctx.json({ success: false })
						);
					}					
					return res(
						ctx.json({ success: true })
					);					
				})
			);
		});

		it("should return success when valid last name is entered", async () => {
			server.use(
				rest.post(`${process.env.REACT_APP_URL}/signup`, (req, res, ctx) => {
					const { lastName } = req.body;
					if (lastName !== 'To') {
						return res(
							ctx.status(401), 
							ctx.json({ success: false })
						);
					}					
					return res(
						ctx.json({ success: true })
					);					
				})
			);
		});

		it("should return success when valid email is entered", async () => {
			server.use(
				rest.post(`${process.env.REACT_APP_URL}/signup`, (req, res, ctx) => {
					const { uniEmail } = req.body;
					if (uniEmail !== 'Pacto@uni.ac.uk') {
						return res(
							ctx.status(401), 
							ctx.json({ success: false })
						);
					}					
					return res(
						ctx.json({ success: true })
					);					
				})
			);
		});

		it("should return success when valid password is entered", async () => {
			server.use(
				rest.post(`${process.env.REACT_APP_URL}/signup`, (req, res, ctx) => {
					const { password } = req.body;
					if (password !== 'Password123') {
						return res(
							ctx.status(401), 
							ctx.json({ success: false })
						);
					}					
					return res(
						ctx.json({ success: true })
					);					
				})
			);
		});

		it("should return success when valid confirmPassword is entered", async () => {
			server.use(
				rest.post(`${process.env.REACT_APP_URL}/signup`, (req, res, ctx) => {
					const { confirmPassword } = req.body;
					if (confirmPassword !== 'Password123') {
						return res(
							ctx.status(401), 
							ctx.json({ success: false })
						);
					}					
					return res(
						ctx.json({ success: true })
					);			
				})
			);
		});

		it("should redirect to login when the sign up button is pressed with valid credentials", async () => {
			server.use(
				rest.post(`${process.env.REACT_APP_URL}/signup`, (req, res, ctx) => {
					return res(
						ctx.status(200),
						ctx.json({ message: 'Success', errors: [] })
					);
				})
			);
			const buttonElement = await screen.findByRole("button", {
				name: "Sign Up",
			});
			fireEvent.click(buttonElement);
			expect(window.location.pathname).toBe("/login");
		});
	});
});
