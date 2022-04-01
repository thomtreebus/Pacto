/**
 * Tests for the login page.
 */

import { screen, fireEvent } from "@testing-library/react";
import { waitForElementToBeRemoved } from "@testing-library/react";
import Login from "../pages/LoginPage";
import "@testing-library/jest-dom";
import { rest } from "msw";
import AuthRoute from "../components/AuthRoute";
import PrivateRoute from "../components/PrivateRoute";
import { Switch } from "react-router-dom";
import { useMockServer } from "./utils/useMockServer";
import mockRender from "./utils/mockRender";

const MockLogin = () => {
	return (
		<>
			<Login />
			<AuthRoute exact path="/login">
				<h1>Redirected to feed</h1>
			</AuthRoute>
			<PrivateRoute path="*">
				<Switch>
					<PrivateRoute exact path="/feed">
						<h1>Redirected to feed</h1>
					</PrivateRoute>
				</Switch>
			</PrivateRoute>
		</>
	);
}


describe("LoginPage Tests", () => {
	let history;
	const server = useMockServer();

	beforeEach(async () => {
		server.use(
			rest.post(`${process.env.REACT_APP_URL}/login`, (req, res, ctx) => {
				return res(
					ctx.status(401),
					ctx.json({
						message: null,
						errors: [{ field: null, message: "Incorrect credentials." }],
					})
				);
			})
		);
	});

	beforeEach(async () => {
		history = await mockRender(<MockLogin/>, '/login');
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

		it("should redirect to sign up if the 'Don't have an account? Sign Up' button is pressed", async () => {
			const linkElement = await screen.findByRole("link", {
				name: "Don't have an account? Sign Up",
			});
			fireEvent.click(linkElement);
			expect(history.location.pathname).toBe("/signup");
		});

		it("should show an error snackbar with text 'Incorrect credentials.' when the login button is pressed with a invalid credentials", async () => {
			const buttonElement = await screen.findByRole("button", {
				name: "Sign In",
			});

			fireEvent.click(buttonElement);

			const snackbarElement = await screen.findByText("Incorrect credentials.");
			expect(snackbarElement).toBeInTheDocument();
		});

		it("should close the snackbar when the cross button is pressed", async () => {
			const loginButtonElement = await screen.findByRole("button", {
				name: "Sign In",
			});
			fireEvent.click(loginButtonElement);

			const snackbarButtonElement = await screen.findByTestId("snackbar");
			expect(snackbarButtonElement).toBeInTheDocument();
			fireEvent.click(snackbarButtonElement.querySelector("button"));

			await waitForElementToBeRemoved(() => screen.queryByTestId("snackbar"));
		});

		it("should close the snackbar when 6 seconds have passed", async () => {
			const loginButtonElement = await screen.findByRole("button", {
				name: "Sign In",
			});
			fireEvent.click(loginButtonElement);

			const snackbarButtonElement = await screen.findByTestId("snackbar");
			expect(snackbarButtonElement).toBeInTheDocument();
			setTimeout(() => {
				expect(screen.queryByTestId("snackbar")).not.toBeInTheDocument();
			}, 6500);
		});

		it("should redirect to feed when the login button is pressed with valid credentials", async () => {
			server.use(
				rest.post(`${process.env.REACT_APP_URL}/login`, (req, res, ctx) => {
					return res(
						ctx.status(200),
						ctx.json({ message: { id: 3724682634 }, errors: [] })
					);
				})
			);

			const buttonElement = await screen.findByRole("button", {
				name: "Sign In",
			});
			fireEvent.click(buttonElement);
			const redirectMessage = await screen.findByText(/Redirected to feed/i);
			expect(redirectMessage).toBeInTheDocument();
			expect(history.location.pathname).toBe("/feed");
		});

		it("should display an error in the snack bar if there is one", async () => {
			server.use(
				rest.post(`${process.env.REACT_APP_URL}/login`, (req, res, ctx) => {
					return res().networkError("Something went wrong.");
				})
			);

			const buttonElement = await screen.findByRole("button", {
				name: "Sign In",
			});

			fireEvent.click(buttonElement);
			const snackbarMessage = await screen.findByText(
				/Network request failed/i
			);
			expect(snackbarMessage).toBeInTheDocument();
		});
	});
});
