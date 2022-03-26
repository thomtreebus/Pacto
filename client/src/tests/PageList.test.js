import { fireEvent, render, screen } from "@testing-library/react";
import { waitForElementToBeRemoved } from "@testing-library/react";
import "@testing-library/jest-dom";
import PageList from "../components/PageList";
import MockComponent from "./utils/MockComponent";
import { rest } from "msw";
import { setupServer } from "msw/node";

describe("Page List Tests", () => {
	const server = setupServer(
		rest.get(`${process.env.REACT_APP_URL}/me`, (req, res, ctx) => {
			return res(
				ctx.json({ message: { firstName: "pac", lastName: "to" }, errors: [] })
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
				<PageList />
			</MockComponent>
		);

		await waitForElementToBeRemoved(() => screen.getByText("Loading"));
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
