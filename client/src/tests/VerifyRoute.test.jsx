/**
 * Tests for the components in the verify page
 */

import { screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { rest } from "msw";

import { useMockServer } from "./utils/useMockServer";
import mockRender from "./utils/mockRender";
import Verify from "../pages/Verify";

describe("Edit Profile Page Tests", () => {
  let history;
  const server = useMockServer();

  beforeEach(async () => {
    server.use(
      rest.get(`${process.env.REACT_APP_URL}/me`, (req, res, ctx) => {
        return res(
          ctx.json({ message: {}, errors: [] })
        );
      }),
      rest.get(`${process.env.REACT_APP_URL}/verify`, (req, res, ctx) => {
        return res(
          ctx.status(201),
          ctx.json({}),
        );
      })
    );
  });

  beforeEach(async () => {
    history = await mockRender(<Verify id={"123"} />);
  });

  describe("Check elements are rendered", () => {
    it("should render the verify button", async () => {
      const verifyButton = await screen.findByText("Verify account")
      expect(verifyButton).toBeInTheDocument();
    });

  });

  describe("Check interaction with elements", () => {
    it("It should redirect to / when valid response ", async () => {
      const verifyButton = await screen.findByText("Verify account")
      fireEvent.click(verifyButton);
      expect(history.location.pathname).toBe("/")
    });
  });
});
