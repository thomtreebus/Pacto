import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import PostList from "../components/PostList";
import "@testing-library/jest-dom";
import testdata from "./utils/testPosts"

describe("PostList Tests", () => {
  beforeEach(() => {
    render(<PostList posts={testdata}/>)
  })
  describe("Check elements are rendered", () => {
    it("should render 8 posts", () => {
      expect(screen.getAllByTestId("card").length).toBe(8);
    });

    it("should render search box", () => {
      screen.getByTestId("search-box");
    });
  });

  describe("Check interaction with elements", () => {
    it("should be able to type into search box", () => {
      const inputElementCard = screen.getByTestId("search-box");
			const inputElement = inputElementCard.querySelector("input");
      expect(inputElement.value).toBe("");
			fireEvent.change(inputElement, { target: { value: "haha" } });
      expect(inputElement.value).toBe("haha");
    });

    it("should filter posts based on the search query", () => {
      const inputElementCard = screen.getByTestId("search-box");
			const inputElement = inputElementCard.querySelector("input");
			fireEvent.change(inputElement, { target: { value: "haha" } });
      waitFor(
        () => expect(screen.getAllByTestId("card").length).toBe(2)
      )
    });

    it("should clean search box when x button is pressed", () => {
      const inputElementCard = screen.getByTestId("search-box");
			const inputElement = inputElementCard.querySelector("input");
			fireEvent.change(inputElement, { target: { value: "haha" } });
      fireEvent.click(inputElementCard.querySelector("button"));
      expect(inputElement.value).toBe("");
    });
  });
});
