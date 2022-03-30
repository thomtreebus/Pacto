import { render, screen, waitForElementToBeRemoved } from "@testing-library/react";
import "@testing-library/jest-dom";
import { rest } from "msw";
import { setupServer } from "msw/node";
import MockComponent from "./utils/MockComponent";
import { Router, Route } from "react-router-dom";
import { createMemoryHistory } from 'history';
import userEvent from "@testing-library/user-event";
import PactMembersTab from "../components/PactPage/PactMembersTab";
import { useMockServer } from "./utils/useMockServer";

const response = {
  message: {
    _id : "1",
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
        createdAt: new Date(Date.now() - (86400000) * 0).toISOString(),
        title: "Lorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem",
        text: "Lorem ipsum dolor inventore ad! Porro soluta eum amet officia molestias esse!Lorem ipsum dolor inventore ad! Porro soluta eum amet officia molestias esse!Lorem ipsum dolor inventore ad! Porro soluta eum amet officia molestias esse!",
        type: "text",
        votes: 6,
        upvoters: [],
        downvoters: [],
        comments: [0,0,0,0],
        _id: 1
      }
    ],
    moderators : [
      {_id: "5"},
      {_id: "10"},
      {_id: "11"},
    ],
    bannedUsers : [
      {_id: "51"},
      {_id: "52"},
      {_id: "53"},
      {_id: "54"},
    ],
    members : [
      {_id: "100"},
      {_id: "101"},
      {_id: "102"},
      {_id: "103"},
      {_id: "104"},
    ],

  }
}

describe("PactPage Tests", () => {
  const server = useMockServer();

  beforeEach(async () => {
    server.use(
      rest.get(`${process.env.REACT_APP_URL}/me`, (req, res, ctx) => {
        return res(
          ctx.json({
            message: {
              firstName: "pac",
              lastName: "to",
              _id: response.message.moderators[0]._id,
              pacts: [response.message._id]
            }, errors: []
          })
        );
      }),
      rest.get(`${process.env.REACT_APP_URL}/pact/1`, (req, res, ctx) => {
        return res(
          ctx.json(response)
        );
      }),
      rest.delete(`${process.env.REACT_APP_URL}/pact/1/leave`, (req, res, ctx) => {
        return res(
          ctx.json({message: "Successfully left the pact", errors: []})
        );
      }),
      rest.delete(`${process.env.REACT_APP_URL}/pact/1/delete`, (req, res, ctx) => {
        return res(
          ctx.json({message: "Successfully deleted the pact", errors: []})
        );
      })
    );
  });

  let history;

  const renderWithMock = async () => {
    history = createMemoryHistory({initialEntries: [`/pact/1`]});

    render(
      <MockComponent>
        <Router history={history}>
          <Route exact path="/pact/:pactID">
            <PactMembersTab pact={response.message}/>
          </Route>
        </Router>
      </MockComponent>
    );

    await waitForElementToBeRemoved(() => screen.getByText("Loading"));
  }

  describe("Check elements are rendered", () => {
    describe("When the user is a a normal user", () => {
      it("Only shows 2 tabs as normal user", async () => {
        server.use(
          rest.get(`${process.env.REACT_APP_URL}/me`, (req, res, ctx) => {
            return res(
              ctx.json({
                message: {
                  firstName: "pac",
                  lastName: "to",
                  _id: 9999,
                  pacts: [response.message._id]
                }, errors: []
              })
            );
          })
        )
        await renderWithMock();

        const allButton = await screen.findByText("All");
        const moderatorsButton = await screen.findByText("Moderators")
        expect(allButton).toBeInTheDocument();
        expect(moderatorsButton).toBeInTheDocument();
        expect(screen.queryByText("Banned")).not.toBeInTheDocument();
      });
    })

    describe("When the user is a a moderator", () => {
      beforeEach(async () => {
        await renderWithMock();
      });

      it("Shows 3 tabs when moderator" , async () => {
        const allButton = await screen.findByText("All");
        const moderatorsButton = await screen.findByText("Moderators")
        const bannedButton = await screen.findByText("Moderators")
        expect(allButton).toBeInTheDocument();
        expect(moderatorsButton).toBeInTheDocument();
        expect(bannedButton).toBeInTheDocument();
      })
    })
  });

  describe("Interaction with elements", () => {
    beforeEach(async () => {
      await renderWithMock();
    });
    it("Can click on the 3 tabs", async () => {
      const allButton = await screen.findByText("All")
      userEvent.click(allButton);
      expect(allButton).toHaveAttribute("aria-selected", "true")

      const moderatorsButton = await screen.findByText("All")
      userEvent.click(moderatorsButton);
      expect(moderatorsButton).toHaveAttribute("aria-selected", "true")

      const bannedButton = await screen.findByText("Banned")
      userEvent.click(bannedButton);
      expect(bannedButton).toHaveAttribute("aria-selected", "true")
    })
  })
});
