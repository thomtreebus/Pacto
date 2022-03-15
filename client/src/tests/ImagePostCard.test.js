import { render, screen } from "@testing-library/react";
import ImagePostCard from "../components/cards/ImagePostCard";
import "@testing-library/jest-dom";

describe("Image Post Card Tests", () => {
  it("should render a posts text", async () => {
    render(<ImagePostCard post={{ image: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fpixy.org%2Fsrc%2F21%2F219269.jpg&f=1&nofb=1" }} />);
    const img = screen.getByRole("img");
    expect(img.src).toBe("https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fpixy.org%2Fsrc%2F21%2F219269.jpg&f=1&nofb=1");
  })
})