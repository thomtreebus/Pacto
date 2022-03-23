import { render, screen, waitForElementToBeRemoved } from "@testing-library/react";
import Feed from "../pages/Feed";
import "@testing-library/jest-dom";
import { rest } from "msw";
import { setupServer } from "msw/node";
import MockComponent from "./utils/MockComponent";
import { Router, Route } from "react-router-dom";
import { createMemoryHistory } from 'history';

const response = {
  message: [
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
  ]
}

describe("FeedPage Tests", () => {
  const server = setupServer(
		rest.get(`${process.env.REACT_APP_URL}/me`, (req, res, ctx) => {
			return res(
				ctx.json({ message: { firstName: "pac", lastName: "to", _id: "5" }, errors: [] })
			);
		}),
		rest.get(`${process.env.REACT_APP_URL}/feed`, (req, res, ctx) => {
			return res(
        ctx.json(response)
      );
		})
	);

	beforeAll(() => {
		server.listen();
	});

	afterAll(() => {
		server.close();
	});

	beforeEach(async () => {
		server.resetHandlers();
	});

  let history;

  const renderWithMock = async () => {
    history = createMemoryHistory({ initialEntries: [`/feed`] });

    render(
      <MockComponent>
        <Router history={history}>
          <Route exact path="/feed">
            <Feed />
          </Route>
          <Route exact path="/not-found">
            Not Found
          </Route>
        </Router>
      </MockComponent>
    );

    await waitForElementToBeRemoved(() => screen.getByText("Loading"));
  }

  describe("Check elements are rendered", () => {
    describe("Normal behaviour", () => {
      beforeEach(async () => {
        await renderWithMock();
      });
      it("Check PostList is rendered", async () => {
        await screen.findByTestId("search-box");
      });
    })
  })
})
