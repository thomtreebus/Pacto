import { render, screen } from "@testing-library/react";
import { waitForElementToBeRemoved } from "@testing-library/react";
import "@testing-library/jest-dom";
import MockComponent from "./utils/MockComponent";
import BaseLayout from "../layouts/BaseLayout";
import { rest } from "msw";
import { setupServer } from "msw/node";
import pacts from "./utils/testPacts";
import { useMockServer } from "./utils/useMockServer"

describe("BaseLayout Tests", () => {
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

	async function renderComponent() {
		render(
			<MockComponent>
				<BaseLayout>
					<h1>This is my base layout</h1>
				</BaseLayout>
			</MockComponent>
		);
		await waitForElementToBeRemoved(() => screen.getByText("Loading"));
	}

	beforeEach(async () => {
		await renderComponent();
	});

	it("renders the component surrounded by an appbar", async () => {
		const textElement = screen.getByPlaceholderText(/Search/i);
		expect(textElement).toBeInTheDocument();
	});

	it("renders the component with the side bar", async () => {
		const textElements = await screen.findAllByText(/Feed/i);
		expect(textElements[0]).toBeInTheDocument();
	});
});
