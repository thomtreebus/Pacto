import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import MockComponent from "./utils/MockComponent.jsx";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { BrowserRouter, Route } from "react-router-dom";
import pacts from "./utils/testPacts";
import PactListItem from "../components/PactListItem.jsx";

describe("Pact List Tests", () => {
	beforeEach(() => {
		render(
			<BrowserRouter>
				<PactListItem pact={pacts[0]} />
			</BrowserRouter>
		);
	});

	describe("Check elements are rendered", () => {
		it("should render the pacts name", async () => {
			const pactName = screen.getByText(pacts[0].name);
			expect(pactName).toBeInTheDocument();
		});

		it("should render a the pacts image", async () => {
			const avatar = screen.getByTestId(/avatar/i);
			const image = avatar.querySelector("img");
			expect(image).toBeInTheDocument();
			expect(image).toHaveAttribute("src", pacts[0].image);
		});
	});

	describe("Check elements iteractions", () => {
		it("should redirect to the pact page when the pact item is clicked on", () => {
			const item = screen.getByTestId(/item/i);
			expect(item).toBeInTheDocument();
			fireEvent.click(item);
			expect(window.location.pathname).toBe(`/pact/${pacts[0]._id}`);
		});
	});
});
