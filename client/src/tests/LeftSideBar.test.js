/**
 * Tests for the left and the mobile sidebar.
 */

import { fireEvent, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { rest } from "msw";
import pacts from "./utils/testPacts";
import LeftSideBar from "../layouts/LeftSideBar";
import { useMockServer } from "./utils/useMockServer"
import mockRender from "./utils/mockRender";

describe("Left Sidebar tests", () => {
	let history;
	const server = useMockServer();

	beforeEach(async () => {
		server.use(
			rest.get(`${process.env.REACT_APP_URL}/university`, (req, res, ctx) => {
				return res(
					ctx.json({
						message: { pacts: pacts },
						errors: [],
					})
				);
			}),
			rest.get(`${process.env.REACT_APP_URL}/notifications`, (req, res, ctx) => {
				return res(
					ctx.json({ message: [], errors: [] })
				);
			})
		);
	});

	beforeEach(async () => {
		history = await mockRender(<LeftSideBar />);
	});

	describe("Sidebar default state", () => {
		it("permanent sidebar should be visible", () => {
			const permanentSidebar = screen.getByTestId("permanent-sidebar");
			expect(permanentSidebar).toBeVisible();
		});

		it("temporary sidebar should be not visible", () => {
			const temporarySidebar = screen.getByTestId("temporary-sidebar");
			expect(temporarySidebar).not.toBeVisible();
		});
	});

	describe("Mobile view state", () => {
		it("temporary sidebar should be visible when the menu button is clicked", () => {
			const temporarySidebar = screen.getByTestId("temporary-sidebar");
			expect(temporarySidebar).not.toBeVisible();
			const menuButton = screen.getByTestId("sidebar-menu-button");
			fireEvent.click(menuButton);
			expect(temporarySidebar).toBeVisible();
		});
	});
});
