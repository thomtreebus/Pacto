import { render, screen } from "@testing-library/react";
import AboutPact from "../components/AboutPact";
import "@testing-library/jest-dom";

const testdata = {
  name: "PactName",
  description: "PactDescription",
  members: [0,0,0],
  posts: [0,0,0,0,0]
}

describe("AboutPact Tests", () => {
  beforeEach(() => {
    render(<AboutPact pact={testdata} />)
  })

  describe("Check elements are rendered", () => {
    it("should render pact name", () => {
      screen.getByText("PactName");
    });

    it("should render pact description", () => {
      screen.getByText("PactDescription");
    });

    it("should render number of posts", () => {
      screen.getByText("5 posts");
    });

    it("should render number of members", () => {
      screen.getByText("3 members");
    });
  })
})
