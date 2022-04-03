/**
 * Tests for post card component.
 */

import { render, screen } from "@testing-library/react";
import TextPostCard from "../../../components/cards/TextPostCard";
import "@testing-library/jest-dom";

describe("Text Post Card Tests", () => {
  it("should render a posts text", async () => {
    render(<TextPostCard post={{ text: "Lorem Ipsum Dorem Porum Forum" }} />);
    screen.getByText(/Lorem Ipsum Dorem Porum Forum/i);
  })
})