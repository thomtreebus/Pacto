/**
 * Tests for the bae layout component which wraps the component in the sidebars
 * and also add the appbar at the top. 
 */

import { screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import BaseLayout from "../../layouts/BaseLayout";
import { rest } from "msw";
import pacts from "../helpers/testPacts";
import { useMockServer } from "../helpers/useMockServer";
import mockRender from "../helpers/mockRender";

describe("BaseLayout Tests", () => {
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

	const renderComponent = async () => history = await mockRender(<BaseLayout><h1>This is my base layout</h1></BaseLayout>) 

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
