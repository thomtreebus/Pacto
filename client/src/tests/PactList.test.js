import { render, screen, waitForElementToBeRemoved } from "@testing-library/react";
import "@testing-library/jest-dom";
import PactList from "../components/PactList.jsx";
import { rest } from "msw";
import { setupServer } from "msw/node";
import pacts from "./utils/testPacts";
import MockComponent from "./utils/MockComponent.jsx";

describe("Pact List Tests", () => {
	const server = setupServer(
		rest.get(`${process.env.REACT_APP_URL}/me`, (req, res, ctx) => {
			return res(
				ctx.json({ message: {
          _id : "userid1",
          firstName: "pac",
          lastName: "to"
          }, errors: [] })
			);
		}),
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

	const renderWithMock = async (element) => {
		render(
			<MockComponent>
				{element}
			</MockComponent>
		);

    await waitForElementToBeRemoved(() => screen.getByText("Loading"));
	};

	describe("Check elements are rendered", () => {
		it("should render a message saying no pacts when the array is empty", async () => {
			await renderWithMock(<PactList pacts={[]} />);
			const message = screen.getByText(/no more pacts/i);
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
