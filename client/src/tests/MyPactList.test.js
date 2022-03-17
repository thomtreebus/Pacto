import { render, screen } from "@testing-library/react";
import { waitForElementToBeRemoved } from "@testing-library/react";
import MockComponent from "./utils/MockComponent";
import "@testing-library/jest-dom";
import { rest } from "msw";
import { setupServer } from "msw/node";
import pacts from "./utils/testPacts";
import MyPactList from "../components/MyPactList";

const user = {
	pacts: [pacts[0]._id, pacts[1]._id],
	firstName: "pac",
	lastName: "to",
	image:
		"https://res.cloudinary.com/djlwzi9br/image/upload/v1644581875/man1_qexxnb.jpg",
	_id: "1",
};

describe("My Pact List tests", () => {
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
				<MyPactList />
			</MockComponent>
		);
		await waitForElementToBeRemoved(() => screen.getByText("Loading"));
	};

	it("renders only only those pacts which the user is a part of", async () => {
		await renderWithMock();
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
