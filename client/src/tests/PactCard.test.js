/***
 * Tests for the pact card.
 */

import { screen } from "@testing-library/react";
import { fireEvent, waitFor } from "@testing-library/react";
import PactCard from "../components/cards/PactCard";
import "@testing-library/jest-dom";
import testPacts from "./utils/testPacts";
import { rest } from "msw";
import { useMockServer } from "./utils/useMockServer";
import mockRender from "./utils/mockRender";

describe("Pact Card Tests", () => {
	let history;
	const server = useMockServer();

	beforeEach(async () => {
		server.use(
			rest.post(`${process.env.REACT_APP_URL}/pact/:id/join`, (req, res, ctx) => {
				return res(
					ctx.json({
						message: "Successfully joined the pact",
						errors: [],
					})
				);
			})
		);
	});

	const renderWithMock = async (element) => {
		history = await mockRender(element);
	};

	describe("renders the correct static elements of the pact", () => {
		beforeEach(async () => {
			await renderWithMock(<PactCard pact={testPacts[0]} />);
		});

		it("should render the pact image", () => {
			const cardImage = screen.getByAltText(/image/i);
			expect(cardImage).toBeInTheDocument();
		});

		it("should render the pact category", () => {
			const categoryText = screen.getByText(/course/i);
			expect(categoryText).toBeInTheDocument();
		});

		it("should render the pact title", () => {
			const nameText = screen.getByText(/Pact1/i);
			expect(nameText).toBeInTheDocument();
		});

		it("should render the pact description", () => {
			const descriptionText = screen.getByText(/description/i);
			expect(descriptionText).toBeInTheDocument();
		});
	});

	describe("renders the correct number of people in a pact", () => {
		it("should render the number of people in a pact when there is only one member", async () => {
			await renderWithMock(<PactCard pact={testPacts[0]} />);
			const numberOfPeopleText = screen.getByTestId(/member/i);
			expect(numberOfPeopleText).toBeInTheDocument();
			expect(numberOfPeopleText.textContent.trim()).toBe("1");
		});

		it("should render the number of people in a pact when there are no members", async () => {
			await renderWithMock(<PactCard pact={testPacts[1]} />);
			const numberOfPeopleText = screen.getByTestId(/member/i);
			expect(numberOfPeopleText).toBeInTheDocument();
			expect(numberOfPeopleText.textContent.trim()).toBe("0");
		});

		it("should render the number of people in a pact when there are multiple members", async () => {
			await renderWithMock(<PactCard pact={testPacts[2]} />);
			const numberOfPeopleText = screen.getByTestId(/member/i);
			expect(numberOfPeopleText).toBeInTheDocument();
			expect(numberOfPeopleText.textContent.trim()).toBe("2");
		});
	});

	describe("button interactions", () => {
		it("should render the error message if there is an error", async () => {
			await renderWithMock(<PactCard pact={testPacts[0]} />);

			server.use(
				rest.post(
					`${process.env.REACT_APP_URL}/pact/:id/join`,
					(req, res, ctx) => {
						return res(
							ctx.json({
								message: null,
								errors: [{ field: null, message: "Pact not found." }],
							})
						);
					}
				)
			);

			const button = screen.getByText(/Join/i);
			expect(button).not.toBeDisabled();
			fireEvent.click(button);
			expect(button).toBeDisabled();
			const error = await screen.findByText(/not found/i);
			expect(error).toBeInTheDocument();
			expect(button).not.toBeDisabled();
			expect(history.location.pathname).toBe("/");
		});

		describe("render the correct button", () => {
			async function testViewButtonClick(button) {
				fireEvent.click(button);
				await waitFor(() => expect(history.location.pathname).toBe("/pact/1"));
			}

			async function testSuccessfulJoinButtonClick(button) {
				expect(button).not.toBeDisabled();
				fireEvent.click(button);
				expect(button).toBeDisabled();
				await waitFor(() => expect(history.location.pathname).toBe("/pact/1"));
			}

			it("should render the not joined button when no joined is supplied", async () => {
				await renderWithMock(<PactCard pact={testPacts[0]} />);
				const button = screen.getByText(/Join/i);
				expect(button).toBeInTheDocument();
				await testSuccessfulJoinButtonClick(button);
			});

			it("should render the not joined button when joined is explicit false", async () => {
				await renderWithMock(<PactCard pact={testPacts[0]} joined={false} />);
				const button = screen.getByText(/Join/i);
				expect(button).toBeInTheDocument();
				await testSuccessfulJoinButtonClick(button);
			});

			it("should render the joined button when joined is supplied", async () => {
				await renderWithMock(<PactCard pact={testPacts[0]} joined />);
				const button = screen.getByText(/View/i);
				expect(button).toBeInTheDocument();
				await testViewButtonClick(button);
			});

			it("should render the joined button when joined is explicitly true", async () => {
				await renderWithMock(<PactCard pact={testPacts[0]} joined={true} />);
				const button = screen.getByText(/View/i);
				expect(button).toBeInTheDocument();
				await testViewButtonClick(button);
			});
		});
	});
});
