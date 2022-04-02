/**
 * Tests for the "about pact" components which is used in the pact
 * page to display information of the pact currently being used.
 */

import { render, screen } from "@testing-library/react";
import AboutPact from "../components/AboutPact";
import "@testing-library/jest-dom";
import pacts from "./utils/testPacts";

describe("AboutPact Tests", () => {
  beforeEach(() => {
    render(<AboutPact pact={pacts[3]} />)
  })

  describe("Check elements are rendered", () => {
    it("should render pact name", () => {
      screen.getByText(pacts[3].name);
    });

    it("should render pact description", () => {
      screen.getByText(pacts[3].description);
    });

    it("should render number of posts", () => {
      screen.getByText(`${pacts[3].posts.length} posts`);
    });

    it("should render number of members", () => {
      screen.getByText(`${pacts[3].members.length} members`);
    });
  })
})
