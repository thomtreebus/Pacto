import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { waitForElementToBeRemoved } from "@testing-library/react";
import CreatePostCard from "../components/CreatePostCard";
import "@testing-library/jest-dom";
import MockComponent from "./utils/MockComponent";
import { rest } from "msw";
import { setupServer } from "msw/node";

describe("CreatePostCard Tests", () => {
	const server = setupServer(
		rest.get(`${process.env.REACT_APP_URL}/me`, (req, res, ctx) => {
			return res(
				ctx.json({ message: { firstName: "pac", lastName: "to" }, errors: [] })
			);
		}),
		rest.post(`${process.env.REACT_APP_URL}/pact`, (req, res, ctx) => {
			return res(
				ctx.status(401),
				ctx.json({
					message: null,
					errors: [{ field: null, message: "The details entered are invalid." }],
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

	beforeEach(async () => {
		render(
			<MockComponent>
				<CreatePostCard />
			</MockComponent>
		);
		await waitForElementToBeRemoved(() => screen.getByText("Loading"));
	});

	describe("Check elements are rendered", () => {

  });
});
