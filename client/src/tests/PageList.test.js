import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";
import PactList from "../components/PactList.jsx";
import pacts from "./utils/testPacts";
import pages from "../components/PageList";
import PageList from "../components/PageList";

describe("Page List Tests", () => {
	beforeEach(() => {
		render(
			<BrowserRouter>
				<PageList />
			</BrowserRouter>
		);
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
				expect(window.location.pathname).toBe(page.url);
			});
		});
	});
});
