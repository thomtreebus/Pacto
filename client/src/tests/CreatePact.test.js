import { render, screen, fireEvent } from "@testing-library/react";
import { waitForElementToBeRemoved } from "@testing-library/react";
import CreatePact from "../pages/CreatePact";
import "@testing-library/jest-dom";
import MockComponent from "./utils/MockComponent";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { Route } from "react-router-dom";

describe("LoginPage Tests", () => {
	const server = setupServer(
		rest.get(`${process.env.REACT_APP_URL}/me`, (req, res, ctx) => {
			return res(
				ctx.json({ message: { firstName: "pac", lastName: "to" }, errors: [] })
			);
		}),
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
			const selectElement = await screen.findByTestId("category-select")
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
	});
});
