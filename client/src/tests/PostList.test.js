/**
 * Tests for the post list.
 */

import { screen, fireEvent, waitFor } from "@testing-library/react";
import PostList from "../components/PostList";
import "@testing-library/jest-dom";
import testdata from "./utils/testPosts"
import { useMockServer } from "./utils/useMockServer";

import mockRender from "./utils/mockRender";

describe("PostList Tests", () => {
  const server = useMockServer();

  beforeEach(async () => {
    await mockRender(<PostList posts={testdata} />)
  })

  describe("Check elements are rendered", () => {
    it("should render 8 posts", async () => {
      await waitFor(() => {
        expect(screen.getAllByTestId("card").length).toBe(8);
      })
    });

    it("should render search box", async () => {
      await waitFor(() => {
        screen.getByTestId("search-box");
      })
    });
  });

  describe("Check interaction with elements", () => {
    it("should be able to type into search box", async () => {
      const inputElementCard = await screen.findByTestId("search-box");
			const inputElement = inputElementCard.querySelector("input");
      expect(inputElement.value).toBe("");
			fireEvent.change(inputElement, { target: { value: "haha" } });
      expect(inputElement.value).toBe("haha");
    });

    it("should filter posts based on the search query", async () => {
      const inputElementCard = await screen.findByTestId("search-box");
			const inputElement = inputElementCard.querySelector("input");
			fireEvent.change(inputElement, { target: { value: "haha" } });
      waitFor(
        () => expect(screen.getAllByTestId("card").length).toBe(2)
      )
    });

    it("should clean search box when x button is pressed", async () => {
      const inputElementCard = await screen.findByTestId("search-box");
			const inputElement = inputElementCard.querySelector("input");
			fireEvent.change(inputElement, { target: { value: "haha" } });
      fireEvent.click(inputElementCard.querySelector("button"));
      expect(inputElement.value).toBe("");
    });
  });
});
