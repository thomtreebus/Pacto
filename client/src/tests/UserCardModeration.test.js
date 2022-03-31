/**
 * Tests for the user card component variant which also includes moderation tools.
 */

import { screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import MockComponent from "./utils/MockComponent";
import {rest} from "msw";
import testUsers from "./utils/testUsers"
import UserCardModeration from "../components/UserCardModeration";
import userEvent from "@testing-library/user-event";
import {act} from "react-dom/test-utils";
import {useMockServer} from "./utils/useMockServer";
import mockRender from "./utils/mockRender";

const pactResponse = {
  message: {
    _id: "1",
    name: "PactName",
    description: "PactDescription",
    posts: [
      {
        pact: 5,
        author: {
          firstName: "Krishi",
          lastName: "Wali",
          _id: 1
        },
        createdAt: new Date(Date.now()).toISOString(),
        title: "Lorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem",
        text: "Lorem ipsum dolor inventore ad! Porro soluta eum amet officia molestias esse!Lorem ipsum dolor inventore ad! Porro soluta eum amet officia molestias esse!Lorem ipsum dolor inventore ad! Porro soluta eum amet officia molestias esse!",
        type: "text",
        votes: 6,
        upvoters: [],
        downvoters: [],
        comments: [0, 0, 0, 0],
        _id: 1
      }
    ],
    moderators: [
      {_id: "1"},
    ],
    bannedUsers: [
      {_id: "51"},
      {_id: "52"},
      {_id: "53"},
      {_id: "54"},
    ],
    members: [
      {_id: "100"},
      {_id: "101"},
      {_id: "102"},
      {_id: "103"},
      {_id: "104"},
    ],

  }
}

describe("UserCard Tests", () => {
  let history;
  const server = useMockServer();

  beforeEach(async () => {
    server.use(
      rest.get(`${process.env.REACT_APP_URL}/me`, (req, res, ctx) => {
        return res(
          ctx.json({
            message: {
              firstName: "pac",
              lastName: "to",
              image: "https://avatars.dicebear.com/api/identicon/temp.svg",
              _id: "1",
            },
            errors: []
          })
        );
      }),
    )
  });

  const renderWithMock = async (element) => {
    history = await mockRender(element);
  };

  describe("Check elements are rendered", () => {
    beforeEach(async () => {
      await renderWithMock(<UserCardModeration user={testUsers[0]} pact={pactResponse.message} showBannedUsers={true}/>);
    });

    it("should render the user's profile picture", async () => {
      const cardImage = await screen.getByAltText(/image/i);
      expect(cardImage).toBeInTheDocument();
    });

    it("should render the user's first name", () => {
      const firstName = screen.getByText(/Pac/i);
      expect(firstName).toBeInTheDocument();
    });

    it("should render the user's last name", () => {
      const lastName = screen.getByText(/To/i);
      expect(lastName).toBeInTheDocument();
    });
  });

  describe("Check interaction with elements", () => {

    it("should redirect to user profile when the user card is pressed", async () => {
      server.use(
        rest.post(`${process.env.REACT_APP_URL}/user/:id`, (req, res, ctx) => {
          return res(
            ctx.status(201),
            ctx.json({
              message: 'Success',
              errors: [],
            })
          );
        })
      );
      await renderWithMock(<UserCardModeration user={testUsers[0]} pact={pactResponse.message} showBannedUsers={true}/>);
      const buttonElement = await screen.findByAltText("user-image");
      fireEvent.click(buttonElement);
      await waitFor(() => expect(history.location.pathname).toBe("/user/1"));
    });

    it("Sends a PUT /pact/:id/:userId/promote response", async () => {
      let called = false;
      server.use(
        rest.put(`${process.env.REACT_APP_URL}/pact/:id/:userId/revokeBan`, (req, res, ctx) => {
          called = true;
          return res(
            ctx.status(200),
            ctx.json({
              message: 'Success',
              errors: [],
            })
          );
        })
      );
      await renderWithMock(<UserCardModeration user={testUsers[1]} pact={pactResponse.message} showBannedUsers={true}/>);
      const unbanButton = await screen.findByTestId("unban-button")

      await act( async () => {
        await userEvent.click(unbanButton);
        await waitFor(() => expect(called).toBe(true));
      });
    });

    it("Sends a PUT /pact/:id/:userId/ban response", async () => {
      let called = false;
      server.use(
        rest.put(`${process.env.REACT_APP_URL}/pact/:id/:userId/ban`, (req, res, ctx) => {
          called = true;
          return res(
            ctx.status(200),
            ctx.json({
              message: 'Success',
              errors: [],
            })
          );
        })
      );
      await renderWithMock(<UserCardModeration user={testUsers[1]} pact={pactResponse.message} showBannedUsers={false}/>);
      const banButton = await screen.findByTestId("ban-button")

      await act( async () => {
        await userEvent.click(banButton);
        await waitFor(() => expect(called).toBe(true));
      });
    });

    it("Sends a PUT /pact/:id/:userId/promote response", async () => {
      let called = false;
      server.use(
        rest.put(`${process.env.REACT_APP_URL}/pact/:id/:userId/promote`, (req, res, ctx) => {
          called = true;
          return res(
            ctx.status(200),
            ctx.json({
              message: 'Success',
              errors: [],
            })
          );
        })
      );
      await renderWithMock(<UserCardModeration user={testUsers[1]} pact={pactResponse.message} showBannedUsers={false}/>);
      const promoteButton = await screen.findByTestId("promote-button")

      await act( async () => {
        await userEvent.click(promoteButton);
        await waitFor(() => expect(called).toBe(true));
      });
    });


    it("A failed PUT request shows error", async () => {
      let called = false;
      server.use(
        rest.put(`${process.env.REACT_APP_URL}/pact/:id/:userId/promote`, (req, res, ctx) => {
          called = true;
          return res(
            ctx.status(400),
            ctx.json({
              message: 'Bad',
              errors: [{
                message: "You may not do that"
              }],
            })
          );
        })
      );
      await renderWithMock(<UserCardModeration user={testUsers[1]} pact={pactResponse.message} showBannedUsers={false}/>);
      const promoteButton = await screen.findByTestId("promote-button")

      await act( async () => {
        await userEvent.click(promoteButton);
        await waitFor(() => expect(called).toBe(true));
        await waitFor(async () => {
          const errorMessage = await screen.findByText("You may not do that")
          expect(errorMessage).toBeInTheDocument();
        })
      });
    });
  });
});