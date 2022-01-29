import { render, screen } from "@testing-library/react";
import { waitForElementToBeRemoved } from "@testing-library/react";
import "@testing-library/jest-dom";
import MockComponent from "./utils/MockComponent";
import BaseLayout from "../layouts/BaseLayout";
import { rest } from "msw";
import { setupServer } from "msw/node";

describe("BaseLayout Tests", () => {
	const server = setupServer(
		rest.get(`${process.env.REACT_APP_URL}/me`, (req, res, ctx) => {
			return res(
				ctx.json({ message: { firstName: "pac", lastName: "to" }, errors: [] })
			);
		})
	);

	beforeAll(() => {
		server.listen();
	});

	afterAll(() => {
		server.close();
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
		server.resetHandlers();
		await renderComponent();
	});

	it("renders the component surrounded by an appbar", async () => {
		const textElement = screen.getByPlaceholderText(/Search/i);
		expect(textElement).toBeInTheDocument();
	});

	it("renders the component with the side bar", async () => {
		const textElement = screen.getByText(/Feed/i);
		expect(textElement).toBeInTheDocument();
	});
});
