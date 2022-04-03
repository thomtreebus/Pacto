/***
 * Tests for the pact chip / the logic for category display.
 */

import { render, screen } from "@testing-library/react";
import PactChip from "../components/pact/pactFeed/PactChip";
import "@testing-library/jest-dom";

describe("Pact Chip Tests", () => {
	it("should render the correct category if it is other", () => {
		render(<PactChip pact={{ category: "other" }} />);
		const chip = screen.getByText(/other/i);
		expect(chip).toBeInTheDocument();
	});

	it("should render the correct category if it is society", () => {
		render(<PactChip pact={{ category: "society" }} />);
		const chip = screen.getByText(/society/i);
		expect(chip).toBeInTheDocument();
	});

	it("should render the correct category if it is course", () => {
		render(<PactChip pact={{ category: "course" }} />);
		const chip = screen.getByText(/course/i);
		expect(chip).toBeInTheDocument();
	});

	it("should render the correct category if it is course", () => {
		render(<PactChip pact={{ category: "module" }} />);
		const chip = screen.getByText(/module/i);
		expect(chip).toBeInTheDocument();
	});

	it("should render the other category if the category is not defined", () => {
		render(<PactChip pact={{ category: "non-existing-category" }} />);
		const chip = screen.getByText(/other/i);
		expect(chip).toBeInTheDocument();
	});
});
