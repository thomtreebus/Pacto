import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { waitForElementToBeRemoved } from "@testing-library/react";
import CreatePact from "../pages/CreatePact";
import "@testing-library/jest-dom";
import MockComponent from "./utils/MockComponent";
import { rest } from "msw";
import { setupServer } from "msw/node";

describe("CreatePact Tests", () => {
	const server = setupServer(
		rest.get(`${process.env.REACT_APP_URL}/me`, (req, res, ctx) => {
			return res(
				ctx.json({ message: { firstName: "pac", lastName: "to" }, errors: [] })
			);
		}),
		rest.post(`${process.env.REACT_APP_URL}/pact`, (req, res, ctx) => {
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
				<CreatePact />
			</MockComponent>
		);
		await waitForElementToBeRemoved(() => screen.getByText("Loading"));
	});

	describe("Check elements are rendered", () => {
    it("should render the Pacto icon element", async () => {
			const avatarElement = await screen.findByAltText("Pacto Icon");
			expect(avatarElement).toBeInTheDocument();
		});

    it("should render the 'Create Pact' header element", async () => {
			const typographyElement = await screen.findByRole("heading", {
				name: "Create Pact",
			});
			expect(typographyElement).toBeInTheDocument();
		});

    it("should render the category select element", async () => {
			const selectElement = await screen.findByTestId("category-select");
			expect(selectElement).toBeInTheDocument();
		});

    it("should render the Pact Name input element", async () => {
			const inputElement = await screen.findByRole("textbox", {
				name: "Pact Name",
			});
			expect(inputElement).toBeInTheDocument();
		});

    it("should render the Description input element", async () => {
			const inputElement = await screen.findByRole("textbox", {
				name: "Description",
			});
			expect(inputElement).toBeInTheDocument();
		});

		it("should render the Upload Image button", async () => {
			const buttonElement = await screen.findByRole("button", {
				name: "Upload Image",
			});
			expect(buttonElement).toBeInTheDocument();
		});

		it("should render the Create Pact button", async () => {
			const buttonElement = await screen.findByRole("button", {
				name: "Create Pact",
			});
			expect(buttonElement).toBeInTheDocument();
		});
	});

	describe("Check interaction with elements", () => { 
		it("should be able to type into name field", async () => { 
			const inputElementDiv = await screen.findByTestId("pact-name");
			const inputElement = inputElementDiv.querySelector("input");
			fireEvent.change(inputElement, { target: { value: "Church of Jeroen" } });
			expect(inputElement.value).toBe("Church of Jeroen");
		});

		it("should be able to type into description field", async () => { 
			const inputElement = await screen.findByRole("textbox", {
				name: "Description",
			});
			fireEvent.change(inputElement, { target: { value: "This is the Church of Jeroen" } });
			expect(inputElement.value).toBe("This is the Church of Jeroen");
		});

		it("should redirect to the created Pact page when the Create Pact page is pressed with valid input", async () => {
			server.use(
				rest.post(`${process.env.REACT_APP_URL}/pact`, (req, res, ctx) => {
					return res(
						ctx.status(201),
						ctx.json({ 
							message: {
								_id: 1,
								name: "Church of Jeroen",
								category: "society",
								description: "This is the Church of Jeroen."
							}, 
							errors: [], 
						})
					);
				})
			);
			const buttonElement = await screen.findByRole("button", {
				name: "Create Pact",
			});
			fireEvent.click(buttonElement);
			await waitFor(() => expect(window.location.pathname).toBe("/pact/1"))
		});

		it("should return error when invalid Pact name is entered and Create Pact button is pressed with invalid input", async () => {
			server.use(
				rest.post(`${process.env.REACT_APP_URL}/pact`, (req, res, ctx) => {
					return res(
						ctx.status(401),
						ctx.json({
							message: null,
							errors: [{
								field: "name", message: "Provide the name"
							}],
						})
					);
				})
			);
			const nonExistingElement = screen.queryByText("Provide the name");
			expect(nonExistingElement).not.toBeInTheDocument();
			const buttonElement = await screen.findByRole("button", {
				name: "Create Pact",
			});
			fireEvent.click(buttonElement);
			const firstNameElement = await screen.findByText("Provide the name");
			expect(firstNameElement).toBeInTheDocument();
		});

		it("should return error when invalid category is entered and Create Pact button is pressed with invalid input", async () => {
			server.use(
				rest.post(`${process.env.REACT_APP_URL}/pact`, (req, res, ctx) => {
					return res(
						ctx.status(401),
						ctx.json({
							message: null,
							errors: [{
								field: "category", message: "Provide the category"
							}],
						})
					);
				})
			);
			const nonExistingElement = screen.queryByText("Provide the category");
			expect(nonExistingElement).not.toBeInTheDocument();
			const buttonElement = await screen.findByRole("button", {
				name: "Create Pact",
			});
			fireEvent.click(buttonElement);
			const firstNameElement = await screen.findByText("Provide the category");
			expect(firstNameElement).toBeInTheDocument();
		});

		it("should return error when invalid description is entered and Create Pact button is pressed with invalid input", async () => {
			server.use(
				rest.post(`${process.env.REACT_APP_URL}/pact`, (req, res, ctx) => {
					return res(
						ctx.status(401),
						ctx.json({
							message: null,
							errors: [{
								field: "description", message: "Provide the description"
							}],
						})
					);
				})
			);
			const nonExistingElement = screen.queryByText("Provide the description");
			expect(nonExistingElement).not.toBeInTheDocument();
			const buttonElement = await screen.findByRole("button", {
				name: "Create Pact",
			});
			fireEvent.click(buttonElement);
			const firstNameElement = await screen.findByText("Provide the description");
			expect(firstNameElement).toBeInTheDocument();
		});

		it("should call handleCategorySelect() when clicking on a different category", async () => {
			const inputElementDiv = await screen.findByTestId("category-select");
			const inputElement = inputElementDiv.querySelector("input");
			fireEvent.change(inputElement, { target: { value: "society" } });
			expect(inputElement.value).toBe("society");
		});
	});
});
