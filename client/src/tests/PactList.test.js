import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";
import PactList from "../components/PactList.jsx";
import pacts from "./utils/testPacts";

describe("Pact List Tests", () => {
	const renderWithMock = async (element) => {
		render(<BrowserRouter>{element}</BrowserRouter>);
	};

	describe("Check elements are rendered", () => {
		it("should render a message saying no pacts when the array is empty", async () => {
			await renderWithMock(<PactList pacts={[]} />);
			const message = screen.getByText(/not in any pacts/i);
			expect(message).toBeInTheDocument();
		});

		it("should render a all the pacts when passed in a list of pacts", async () => {
			await renderWithMock(<PactList pacts={pacts} />);
			pacts.forEach((pact) => {
				const nameElement = screen.getByText(pact.name);
				expect(nameElement).toBeInTheDocument();
			});
		});
	});
});
