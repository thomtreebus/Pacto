/**
 * Tests for the university hub page.
 */

import UniversityHub from "../../../pages/university/UniversityHub";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { rest } from "msw";
import pacts from "../../helpers/testPacts";
import { useMockServer } from "../../helpers/useMockServer";
import mockRender from "../../helpers/mockRender";

describe("University Hub Tests", () => {
	let history;
	const server = useMockServer();

	beforeEach(async () => {
		server.use(
			rest.get(`${process.env.REACT_APP_URL}/university`, (req, res, ctx) => {
				return res(
					ctx.json({
						message: { pacts: pacts },
						errors: [],
					})
				);
			})
		);
	});

	beforeEach(async () => {
		history = await mockRender(<UniversityHub/>);
	});

	describe("Check elements are rendered", () => {
		it("should render the heading prompts", async () => {
			const heading1 = await screen.findByText(/Find/i);
			expect(heading1).toBeInTheDocument();
			const heading2 = await screen.findByText(/make one/i);
			expect(heading2).toBeInTheDocument();
		});

		it("should render the search bar", async () => {
			const searchBar = await screen.findByPlaceholderText(/Search/i);
			expect(searchBar).toBeInTheDocument();
		});

		it("should render the all the category tags", async () => {
			const categories = ["All", "Courses", "Modules", "Societies", "Other"];
			categories.forEach((category) => {
				const tab = screen.getByText(category);
				expect(tab).toBeInTheDocument();
			});
		});

		it("should render the floating action button", async () => {
			const fab = screen.getByTestId(/floating/i);
			expect(fab).toBeInTheDocument();
		});

		it("should render the search icon within a disabled button", async () => {
			const searchIcon = screen.getByTestId(/search-icon/i);
			expect(searchIcon).toBeInTheDocument();
			const searchButton = screen.getByTestId(/search-button/i);
			expect(searchButton).toBeDisabled();
		});
	});

	describe("Check interaction with elements", () => {
		const allPacts = pacts.map((pact) => pact.name);

		async function assertPactsShown(pactsToBeShown) {
			for (let i = 0; i < pacts.length; i++) {
				if (pactsToBeShown.includes(allPacts[i])) {
					const pact = await screen.findByText(allPacts[i]);
					expect(pact).toBeInTheDocument();
				} else {
					const pact = screen.queryByText(allPacts[i]);
					expect(pact).not.toBeInTheDocument();
				}
			}
		}

		describe("Search bar interactions", () => {
			it("should be able to type into search field", async () => {
				const searchBar = await screen.findByPlaceholderText(/Search/i);
				fireEvent.change(searchBar, { target: { value: "some value" } });
				expect(searchBar.value).toBe("some value");
			});

			it("search bar should have clear button when typed into", async () => {
				let searchBar = await screen.findByPlaceholderText(/Search/i);
				fireEvent.change(searchBar, { target: { value: "some value" } });
				expect(searchBar.value).toBe("some value");
				let searchIcon = screen.queryByTestId(/search-icon/i);
				expect(searchIcon).not.toBeInTheDocument();
				let clearIcon = screen.getByTestId(/clear-icon/i);
				expect(clearIcon).toBeInTheDocument();
				let searchButton = screen.getByTestId(/search-button/i);
				expect(searchButton).not.toBeDisabled();
				fireEvent.click(searchButton);
				expect(searchBar.value).toBe("");
				searchIcon = screen.getByTestId(/search-icon/i);
				expect(searchIcon).toBeInTheDocument();
				clearIcon = screen.queryByTestId(/clear-icon/i);
				expect(clearIcon).not.toBeInTheDocument();
				searchButton = screen.getByTestId(/search-button/i);
				expect(searchButton).toBeDisabled();
			});

			it("should filter the pacts to only show those that match the search value", async () => {
				const searchBar = await screen.findByPlaceholderText(/Search/i);
				await assertPactsShown(allPacts);
				fireEvent.change(searchBar, { target: { value: "non existent pact" } });
				await assertPactsShown([]);
				fireEvent.change(searchBar, { target: { value: "Pact1" } });
				await assertPactsShown(["Pact1"]);
				fireEvent.change(searchBar, { target: { value: "Pact2" } });
				await assertPactsShown(["Pact2"]);
				fireEvent.change(searchBar, { target: { value: "Pact" } });
				await assertPactsShown(allPacts);
			});

			it("should filter pacts in a case insensitive manner", async () => {
				const searchBar = await screen.findByPlaceholderText(/Search/i);
				await assertPactsShown(allPacts);
				fireEvent.change(searchBar, { target: { value: "pact1" } });
				await assertPactsShown(["Pact1"]);
			});

			it("should filter pacts using a partial match", async () => {
				const searchBar = await screen.findByPlaceholderText(/Search/i);
				await assertPactsShown(allPacts);
				fireEvent.change(searchBar, { target: { value: "ac" } });
				await assertPactsShown(allPacts);
				fireEvent.change(searchBar, { target: { value: "act1" } });
				await assertPactsShown(["Pact1"]);
			});
		});

		describe("Floating action button interactions", () => {
			it("navigates to the create pact page when the button is pressed", async () => {
				const fab = screen.getByTestId(/floating/i);
				fireEvent.click(fab);
				await waitFor(() =>
					expect(history.location.pathname).toBe("/create-pact")
				);
			});
		});

		describe("Category tab interactions", () => {
			it("only shows the pacts of a given category when a category is selected", async () => {
				const categories = ["Courses", "Modules", "Societies", "Other"];
				const tabs = categories.map((category) => screen.getByText(category));
				fireEvent.click(tabs[0]);
				await assertPactsShown(["Pact1"]);
				fireEvent.click(tabs[1]);
				await assertPactsShown(["Pact2"]);
				fireEvent.click(tabs[2]);
				await assertPactsShown(["Pact3"]);
				fireEvent.click(tabs[3]);
				await assertPactsShown(["Pact4"]);
			});

			it("shows all the pacts when the all category is reselected", async () => {
				const categories = ["Courses"];
				const tabs = categories.map((category) => screen.getByText(category));
				fireEvent.click(tabs[0]);
				await assertPactsShown(["Pact1"]);
				const allTab = screen.getByText("All");
				fireEvent.click(allTab);
				await assertPactsShown(allPacts);
			});
		});
	});
});
