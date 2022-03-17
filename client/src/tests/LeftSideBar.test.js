import { fireEvent, render, screen } from "@testing-library/react";
import { waitForElementToBeRemoved } from "@testing-library/react";
import MockComponent from "./utils/MockComponent";
import "@testing-library/jest-dom";
import { rest } from "msw";
import { setupServer } from "msw/node";
import pacts from "./utils/testPacts";
import LeftSideBar from "../components/LeftSideBar";

const user = {
	pacts: [pacts[0]._id, pacts[1]._id],
	firstName: "pac",
	lastName: "to",
	image:
		"https://res.cloudinary.com/djlwzi9br/image/upload/v1644581875/man1_qexxnb.jpg",
	_id: "1",
};

describe("Left Sidebar tests", () => {
	const server = setupServer(
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

	beforeAll(() => {
		server.listen();
	});

	afterAll(() => {
		server.close();
	});

	beforeEach(async () => {
		server.resetHandlers();
	});

	const renderWithMock = async () => {
		render(
			<MockComponent>
				<LeftSideBar />
			</MockComponent>
		);
		await waitForElementToBeRemoved(() => screen.getByText("Loading"));
	};

	beforeEach(async () => {
		await renderWithMock();
	});

	describe("Sidebar default state", () => {
		it("permenant sidebar should be visible", () => {
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
