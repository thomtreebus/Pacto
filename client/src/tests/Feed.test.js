import Feed from "../pages/Feed";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

describe("Not Found page tests", () => {
	it("renders the component successfully", () => {
		render(<Feed />);
		const title = screen.getByText(/feed/i);
		expect(title).toBeInTheDocument();
	});
});
