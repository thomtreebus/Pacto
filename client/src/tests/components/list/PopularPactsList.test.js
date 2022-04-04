/**
 * Tests for the popular pacts list component.
 */

import { screen } from "@testing-library/react";
import { waitForElementToBeRemoved } from "@testing-library/react";
import "@testing-library/jest-dom";
import { rest } from "msw";
import pacts from "../../helpers/testPacts";
import PopularPactsList from "../../../components/lists/PopularPactsList";
import { useMockServer } from "../../helpers/useMockServer";
import mockRender from "../../helpers/mockRender";
import users from "../../helpers/testUsers";

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

	it("shows unjoined pact with the most members first", async () => {
		await mockRender(<PopularPactsList />);
		await waitForElementToBeRemoved(() => screen.getByText("Loading Pacts..."));
		const items = screen.getAllByTestId("item");
		expect(items.length).toBe(3);
		// The pacts in order according to the number of members
		expect(items[0].textContent).toBe(pacts[2].name);
		expect(items[1].textContent).toBe(pacts[0].name);
		expect(items[2].textContent).toBe(pacts[1].name);
	});

	it("does not show those pacts which the user is a part of", async () => {
		await mockRender(<PopularPactsList />);
		const items = screen.getAllByTestId("item");
		const joinedPactItem = screen.queryByText(pacts[3].name);
		expect(joinedPactItem).not.toBeInTheDocument();
	});
});
