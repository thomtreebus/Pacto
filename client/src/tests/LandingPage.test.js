/**
 * Tests for the landing page.
 */

import Landing from "../pages/Landing";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";

describe("Landing page tests", () => {
	beforeEach(() => {
		render(
			<BrowserRouter>
				<Landing />
			</BrowserRouter>
		);
	});

	describe("Check elements are rendered", () => {
		it("renders the headers", () => {
			const heading1 = screen.getByText(/pact/i);
			const heading2 = screen.getByText(/for students/i);
			expect(heading1).toBeInTheDocument();
			expect(heading2).toBeInTheDocument();
		});

		it("renders the join button", () => {
			const joinButton = screen.getByText(/join/i);
			expect(joinButton).toBeInTheDocument();
		});

		it("renders the already have an account prompt", () => {
			const prompt = screen.getByText(/sign in/i);
			expect(prompt).toBeInTheDocument();
		});
	});

	describe("Check interactions between the elements", () => {
		it("redirects to sign up the join button is clicked", async () => {
			const joinButton = screen.getByText(/join/i);
			fireEvent.click(joinButton);
			await waitFor(() => expect(window.location.pathname).toBe("/signup"));
		});

		it("redirects to login the already have an account prompt is clicked", async () => {
			const prompt = screen.getByText(/sign in/i);
			fireEvent.click(prompt);
			await waitFor(() => expect(window.location.pathname).toBe("/login"));
		});
	});
});
