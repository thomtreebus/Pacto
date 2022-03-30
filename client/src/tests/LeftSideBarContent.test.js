/**
 * Tests for the left side bar which contains mypacts and the navigation links.
 */

import { screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { rest } from "msw";
import pacts from "./utils/testPacts";
import LeftSideBarContent from "../components/LeftSideBarContent";
import { useMockServer } from "./utils/useMockServer";
import mockRender from "./utils/mockRender";

const user = {
	pacts: [pacts[0]._id, pacts[1]._id],
	firstName: "pac",
	lastName: "to",
	image:
		"https://res.cloudinary.com/djlwzi9br/image/upload/v1644581875/man1_qexxnb.jpg",
	_id: "1",
};

describe("Left Sidebar content tests", () => {
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

	describe("Renders the elements", () => {
		beforeEach(async () => {
			await mockRender(<LeftSideBarContent />);
		});

		it("renders the users first and last name", async () => {
			const fullName = `${user.firstName} ${user.lastName}`;
			const nameElement = screen.getByText(fullName);
			expect(nameElement).toBeInTheDocument();
		});

		it("renders the page list", async () => {
			const feedElement = screen.getByText(/feed/i);
			expect(feedElement).toBeInTheDocument();
		});

		it("renders the pact list", async () => {
			const listElement = screen.getByText(/Pact1/i);
			expect(listElement).toBeInTheDocument();
		});
	});
});
