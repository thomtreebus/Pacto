/**
 * Tests for the "my pacts list" component.
 */

import { screen } from "@testing-library/react";
import { waitForElementToBeRemoved } from "@testing-library/react";
import "@testing-library/jest-dom";
import { rest } from "msw";
import pacts from "./helpers/testPacts";
import MyPactList from "../../../components/lists/MyPactList";
import { useMockServer } from "./helpers/useMockServer";
import mockRender from "./helpers/mockRender";

const user = {
	pacts: [pacts[0]._id, pacts[1]._id],
	firstName: "pac",
	lastName: "to",
	image:
		"https://res.cloudinary.com/djlwzi9br/image/upload/v1644581875/man1_qexxnb.jpg",
	_id: "1",
};

describe("My Pact List tests", () => {
	const server = useMockServer();

	beforeEach(async () => {
		server.use(
			rest.get(`${process.env.REACT_APP_URL}/me`, (req, res, ctx) => {
				return res(
					ctx.json({
						message: user,
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

	it("renders only only those pacts which the user is a part of", async () => {
		await mockRender(<MyPactList />);
		await waitForElementToBeRemoved(() => screen.getByText("Loading Pacts..."));

		for (let i = 0; i < 2; i++) {
			const nameElement = screen.getByText(pacts[i].name);
			expect(nameElement).toBeInTheDocument();
		}

		for (let i = 2; i < pacts.length; i++) {
			const nameElement = screen.queryByText(pacts[i].name);
			expect(nameElement).not.toBeInTheDocument();
		}
	});
});
