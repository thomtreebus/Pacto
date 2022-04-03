/**
 * Tests for the components in the verify page
 */

import { screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { rest } from "msw";

import { useMockServer } from "./utils/useMockServer";
import mockRender from "./utils/mockRender";
import Verify from "../pages/auth/Verify";

describe("Edit Profile Page Tests", () => {
	let history;
	const server = useMockServer();

	beforeEach(async () => {
		server.use(
			rest.get(`${process.env.REACT_APP_URL}/me`, (req, res, ctx) => {
				return res(ctx.json({ message: {}, errors: [] }));
			}),
			rest.get(`${process.env.REACT_APP_URL}/verify`, (req, res, ctx) => {
				return res(ctx.status(201), ctx.json({}));
			})
		);
	});

	beforeEach(async () => {
		history = await mockRender(<Verify id={"123"} />);
	});

	describe("Check elements are rendered", () => {
		it("should render the pacto icon", async () => {
			const pactoIcon = await screen.findByAltText(/pacto/i);
			expect(pactoIcon).toBeInTheDocument();
		});

		it("should render the pacto text", async () => {
			const pactText = await screen.findByText(/pacto/i);
			expect(pactText).toBeInTheDocument();
		});

		it("should render the verify button", async () => {
			const verifyButton = await screen.findByText(/verify/i);
			expect(verifyButton).toBeInTheDocument();
		});
	});

	describe("Check interaction with elements", () => {
		it("It should redirect to / when valid response ", async () => {
			const verifyButton = await screen.findByText(/verify/i);
			fireEvent.click(verifyButton);
			expect(verifyButton).toBeDisabled();
			await waitFor(() => expect(history.location.pathname).toBe("/login"));
		});

    it("It should display a message whenever the satus is not successfull", async () => {
      server.use(
				rest.get(`${process.env.REACT_APP_URL}/verify`, (req, res, ctx) => {
					return res(ctx.status(400), ctx.json({}));
				}),
			)
			const verifyButton = await screen.findByText(/verify/i);
			fireEvent.click(verifyButton);
			expect(verifyButton).toBeDisabled();
			const errorMessage = await screen.findByText(/unable/i)
			expect(errorMessage).toBeInTheDocument();
			expect(history.location.pathname).toBe("/");
			expect(verifyButton).not.toBeDisabled();
		});
	});
});
