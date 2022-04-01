/**
 * Tests for the page list that is used in the sidebar.
 */

import { fireEvent, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import PageList from "../components/PageList";
import { useMockServer } from "./utils/useMockServer";
import mockRender from "./utils/mockRender";

describe("Page List Tests", () => {
	let history;
	const server = useMockServer();

	beforeEach(async () => {
		history = await mockRender(<PageList />);
	});

	describe("Check elements are rendered", () => {
		it("should render all the links", async () => {
			["Feed", "University Hub", "Users"].forEach((page) => {
				const linkElement = screen.getByText(page);
				expect(linkElement).toBeInTheDocument();
			});
		});
	});

	describe("Check element interactions", () => {
		it("should highlight the link when it is clicked", () => {
			["Feed", "University Hub", "Users"].forEach((page) => {
				const linkElement = screen.getByText(page);
				expect(linkElement).toBeInTheDocument();
				fireEvent.click(linkElement);
				const selectedElement = linkElement.closest("div.Mui-selected");
				expect(selectedElement.textContent).toBe(page);
			});
		});

		it("should link to the corresponding page when a link is clicked", async () => {
			const pages = [
				{ text: "Feed", url: "/feed" },
				{ text: "University Hub", url: "/hub" },
				{ text: "Users", url: "/users" },
			];

			pages.forEach((page) => {
				const linkElement = screen.getByText(page.text);
				fireEvent.click(linkElement);
				expect(history.location.pathname).toBe(page.url);
			});
		});
	});
});
