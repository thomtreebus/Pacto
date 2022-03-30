import { render, screen, fireEvent } from "@testing-library/react";
import { waitForElementToBeRemoved } from "@testing-library/react";
import PactGrid from "../components/PactGrid";
import "@testing-library/jest-dom";
import MockComponent from "./utils/MockComponent";
import { rest } from "msw";
import { setupServer } from "msw/node";
import pacts from "./utils/testPacts";
import { useMockServer } from "./utils/useMockServer";

describe("PactGrid Tests", () => {
	const server = useMockServer();

	async function renderWithMockComponent(grid) {
		render(<MockComponent>{grid}</MockComponent>);
		await waitForElementToBeRemoved(() => screen.getByText("Loading"));
	}

	it("Renders a message when an empty array is passed in", async () => {
		await renderWithMockComponent(<PactGrid pacts={[]} />);
		const message = screen.getByText(/no pacts/i);
		expect(message).toBeInTheDocument();
	});

	it("Renders a single joined pact when user has joined the pact", async () => {
		await renderWithMockComponent(<PactGrid pacts={[pacts[0]]} />);
		const viewButton = screen.queryByText(/View/i);
		const joinButton = screen.queryByText(/Join/i);
		expect(viewButton).toBeInTheDocument();
		expect(joinButton).not.toBeInTheDocument();
	});

	it("Renders a single unjoined pact when user has not joined the pact", async () => {
		await renderWithMockComponent(<PactGrid pacts={[pacts[1]]} />);
		const viewButton = screen.queryByText(/View/i);
		const joinButton = screen.queryByText(/Join/i);
		expect(viewButton).not.toBeInTheDocument();
		expect(joinButton).toBeInTheDocument();
	});

	it("Renders both an unjoined pact and joined pact when user is in at least one pact but not all", async () => {
		await renderWithMockComponent(<PactGrid pacts={[pacts[1], pacts[0]]} />);
		const viewButton = screen.queryByText(/View/i);
		const joinButton = screen.queryByText(/Join/i);
		expect(viewButton).toBeInTheDocument();
		expect(joinButton).toBeInTheDocument();
	});
});
