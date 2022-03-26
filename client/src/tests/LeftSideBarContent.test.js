import { render, screen } from "@testing-library/react";
import { waitForElementToBeRemoved } from "@testing-library/react";
import MockComponent from "./utils/MockComponent";
import "@testing-library/jest-dom";
import { rest } from "msw";
import { setupServer } from "msw/node";
import pacts from "./utils/testPacts";
import LeftSideBarContent from "../components/LeftSideBarContent";

const user = {
	pacts: [pacts[0]._id, pacts[1]._id],
	firstName: "pac",
	lastName: "to",
	image:
		"https://res.cloudinary.com/djlwzi9br/image/upload/v1644581875/man1_qexxnb.jpg",
	_id: "1",
};

describe("Left Sidebar content tests", () => {
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
				<LeftSideBarContent />
			</MockComponent>
		);
		await waitForElementToBeRemoved(() => screen.getByText("Loading"));
	};

	describe("Renders the elements", () => {
		beforeEach(async () => {
			await renderWithMock();
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
