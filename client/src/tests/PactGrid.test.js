/**
 * Tests for the pact grid which is used in the university hub page.
 */

import { screen } from "@testing-library/react";
import PactGrid from "../components/PactGrid";
import "@testing-library/jest-dom";
import pacts from "./utils/testPacts";
import { useMockServer } from "./utils/useMockServer";
import mockRender from "./utils/mockRender";

describe("PactGrid Tests", () => {
	const server = useMockServer();

	it("Renders a message when an empty array is passed in", async () => {
		await mockRender(<PactGrid pacts={[]} />);
		const message = screen.getByText(/no pacts/i);
		expect(message).toBeInTheDocument();
	});

	it("Renders a single joined pact when user has joined the pact", async () => {
		await mockRender(<PactGrid pacts={[pacts[0]]} />);
		const viewButton = screen.queryByText(/View/i);
		const joinButton = screen.queryByText(/Join/i);
		expect(viewButton).toBeInTheDocument();
		expect(joinButton).not.toBeInTheDocument();
	});

	it("Renders a single un-joined pact when user has not joined the pact", async () => {
		await mockRender(<PactGrid pacts={[pacts[1]]} />);
		const viewButton = screen.queryByText(/View/i);
		const joinButton = screen.queryByText(/Join/i);
		expect(viewButton).not.toBeInTheDocument();
		expect(joinButton).toBeInTheDocument();
	});

	it("Renders both an un-joined pact and joined pact when user is in at least one pact but not all", async () => {
		await mockRender(<PactGrid pacts={[pacts[1], pacts[0]]} />);
		const viewButton = screen.queryByText(/View/i);
		const joinButton = screen.queryByText(/Join/i);
		expect(viewButton).toBeInTheDocument();
		expect(joinButton).toBeInTheDocument();
	});
});
