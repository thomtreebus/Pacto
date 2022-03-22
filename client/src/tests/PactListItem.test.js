import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import MockComponent from "./utils/MockComponent.jsx";
import { rest } from "msw";
import { setupServer } from "msw/node";
import pacts from "./utils/testPacts";
import { waitForElementToBeRemoved } from "@testing-library/react";
import PactListItem from "../components/PactListItem.jsx";

describe("Pact List Item Tests", () => {
	const server = setupServer(
		rest.get(`${process.env.REACT_APP_URL}/me`, (req, res, ctx) => {
			return res(
				ctx.json({
					message: {
						_id: pacts[0].members[0],
						firstName: "pac",
						lastName: "to",
					},
					errors: [],
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

	const renderWithMock = async (element) => {
		render(<MockComponent>{element}</MockComponent>);
		await waitForElementToBeRemoved(() => screen.getByText("Loading"));
	};

	describe("Tests concerning the pacts that the user is in", () => {
		beforeEach(async () => {
			await renderWithMock(<PactListItem pact={pacts[0]} />);
		});

		describe("Check elements are rendered", () => {
			it("should render the pact name", async () => {
				const pactName = screen.getByText(pacts[0].name);
				expect(pactName).toBeInTheDocument();
			});

			it("should render the pact image", async () => {
				const avatar = screen.getByTestId(/avatar/i);
				const image = avatar.querySelector("img");
				expect(image).toBeInTheDocument();
				expect(image).toHaveAttribute("src", pacts[0].image);
			});
		});

		describe("Check elements iteractions", () => {
			it("should redirect to the pact page when the pact item is clicked on if user is member of the pact", () => {
				const item = screen.getByTestId(/item/i);
				expect(item).toBeInTheDocument();
				fireEvent.click(item);
				expect(window.location.pathname).toBe(`/pact/${pacts[0]._id}`);
			});
		});
	});

	describe("Tests concerning the pacts that the user is not in", () => {
		beforeEach(async () => {
			await renderWithMock(<PactListItem pact={pacts[1]} />);
		});

		it("should show the join confirmation dialogue if the user is not a part of the pact", async () => {
			const item = screen.getByTestId(/item/i);
			expect(item).toBeInTheDocument();
			fireEvent.click(item);
			const promptText = await screen.findByText(/Do you want to join/i);
			expect(promptText).toBeInTheDocument();
			const closeButton = await screen.findByText(/close/i);
			fireEvent.click(closeButton);
			waitForElementToBeRemoved(() => promptText);
		});
	});
});
