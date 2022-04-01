/**
 * Tests for the popular pacts list component.
 */

import { screen } from "@testing-library/react";
import { waitForElementToBeRemoved } from "@testing-library/react";
import "@testing-library/jest-dom";
import { rest } from "msw";
import pacts from "./utils/testPacts";
import PopularPactsList from "../components/PopularPactsList";
import { useMockServer } from "./utils/useMockServer";
import mockRender from "./utils/mockRender";
import users from "./utils/testUsers";

describe("Popular Pact List tests", () => {
	const server = useMockServer();

	beforeEach(async () => {
		server.use(
			rest.get(`${process.env.REACT_APP_URL}/me`, (req, res, ctx) => {
				return res(
					ctx.json({
						message: users[2],
						errors: [],
					})
				);
			}),
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

	it("shows unjoined pact with the most memebers first", async () => {
		await mockRender(<PopularPactsList />);
		await waitForElementToBeRemoved(() => screen.getByText("Loading Pacts..."));
		const items = screen.getAllByTestId("item");
		expect(items.length).toBe(3);
		// The pacts in order according to the number of memebers
		expect(items[0].textContent).toBe(pacts[2].name);
		expect(items[1].textContent).toBe(pacts[0].name);
		expect(items[2].textContent).toBe(pacts[1].name);
	});

	it("does not show those pacts which the user is not a part of", async () => {
		await mockRender(<PopularPactsList />);
		const items = screen.getAllByTestId("item");
		const unjoinedPactItem = screen.queryByText(pacts[3].name);
		expect(unjoinedPactItem).not.toBeInTheDocument();
	});
});
