/**
 * Tests for the not found page.
 */

import NotFound from "../pages/NotFound";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

describe("Not Found page tests", () => {
	it("shows the error message when rendered", () => {
		render(<NotFound />);
		const message = screen.getByText(/not found/i);
		expect(message).toBeInTheDocument();
	});
});
