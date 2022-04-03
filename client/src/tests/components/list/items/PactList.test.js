/**
 * Tests for the pact list which is used to display a list of pacts.
 */

import { screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import PactList from "../../../../components/lists/PactList.jsx";
import pacts from "./helpers/testPacts";
import { useMockServer } from "./helpers/useMockServer.js";
import mockRender from "./helpers/mockRender";

describe("Pact List Tests", () => {
	const server = useMockServer();

	describe("Check elements are rendered", () => {
		it("should render a message saying no pacts when the array is empty", async () => {
			await mockRender(<PactList pacts={[]} />);
			const message = screen.getByText(/no more pacts/i);
			expect(message).toBeInTheDocument();
		});

		it("should render a all the pacts when passed in a list of pacts", async () => {
			await mockRender(<PactList pacts={pacts} />);
			pacts.forEach((pact) => {
				const nameElement = screen.getByText(pact.name);
				expect(nameElement).toBeInTheDocument();
			});
		});
	});
});
