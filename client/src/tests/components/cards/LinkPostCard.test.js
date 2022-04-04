/**
 * Tests for the link variant of the post cards.
 */

import { render, screen } from "@testing-library/react";
import LinkPostCard from "../../../components/cards/LinkPostCard";
import "@testing-library/jest-dom";

describe("Link Post Card Tests", () => {
  describe("Check elements are rendered when link preview is provided", () => {
    beforeEach(() => {
      render(
        <LinkPostCard post={{ text: "Lorem Ipsum Dorem Porum Forum", image: "https://google.com/", link: "https://duckduckgo.com/" }} />
      );
    })

    it("should render a links image", async () => {
      const image = screen.getByRole("img");
      expect(image.src).toBe("https://google.com/")
    })

    it("should render a links title", async () => {
      screen.getByText(/Lorem Ipsum Dorem Porum Forum/i);
    })

    it("should render a links url", async () => {
      const link = screen.getByRole("link");
      expect(link.href).toBe("https://duckduckgo.com/")
    })
  })

  describe("Check elements are (not) rendered when link preview is not provided", () => {
    beforeEach(() => {
      render(
        <LinkPostCard post={{ link: "https://duckduckgo.com/" }} />
      );
    })

    it("should not render a links image", async () => {
      expect(screen.queryByRole("img")).not.toBeInTheDocument();
    })

    it("should not render a links title", async () => {
      expect(screen.queryByTestId("text")).not.toBeInTheDocument();
    })

    it("should render a links url", async () => {
      const link = screen.getByRole("link");
      expect(link.href).toBe("https://duckduckgo.com/")
    })
  })
})
