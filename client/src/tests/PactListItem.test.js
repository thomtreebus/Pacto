import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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
						pacts: [],
					},
					errors: [],
				})
			);
		}),
		rest.post(`${process.env.REACT_APP_URL}/pact/:id/join`, (req, res, ctx) => {
			return res(
				ctx.json({ message: "Successfully Joined the pact", errors: [] })
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
			let promptText = await screen.findByText(/Do you want to join/i);
			expect(promptText).toBeInTheDocument();
			const closeButton = await screen.findByText(/close/i);
			fireEvent.click(closeButton);
			promptText = screen.queryByText(/Do you want to join/i);
			expect(promptText).not.toBeInTheDocument();
		});

		it("should allow the user to join a pact", async () => {
			const item = screen.getByTestId(/item/i);
			expect(item).toBeInTheDocument();
			fireEvent.click(item);
			const joinButton = await screen.findByRole("button", { name: "Join" });
			fireEvent.click(joinButton);
			await waitFor(() => expect(window.location.pathname).toBe("/pact/2"));
		});

		it("should show and error message to the user wanting to join if there is one", async () => {
			server.use(
				rest.post(
					`${process.env.REACT_APP_URL}/pact/:id/join`,
					(req, res, ctx) => {
						return res(ctx.json({ message: null, errors: ["Pact not Found"] }));
					}
				)
			);
			const item = screen.getByTestId(/item/i);
			expect(item).toBeInTheDocument();
			fireEvent.click(item);
			const joinButton = await screen.findByRole("button", { name: "Join" });
			fireEvent.click(joinButton);
			const errorMessage = await screen.findByText(/not found/i);
			expect(errorMessage).toBeInTheDocument();
		});
	});
});
