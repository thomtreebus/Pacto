/**
 * Tests for the feed / home page of the application.
 */

import { screen } from "@testing-library/react";
import Feed from "../../../pages/feed/Feed";
import "@testing-library/jest-dom";
import { rest } from "msw";
import { Route } from "react-router-dom";
import { useMockServer } from "../../helpers/useMockServer";
import mockRender from "../../helpers/mockRender";

const response = {
  message: [
      {
        pact: {
          _id : 5,
          moderators: []
        },
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
        comments: [0,0,0,0],
        _id: 1
      }
  ]
}

const MockFeed = () => {
  return (
    <>
      <Route exact path="/feed">
        <Feed />
      </Route>
      <Route exact path="/not-found">
        Not Found
      </Route>
    </>
  )
}

describe("FeedPage Tests", () => {
  const server = useMockServer();

	beforeEach(async () => {
		server.use(
      rest.get(`${process.env.REACT_APP_URL}/feed`, (req, res, ctx) => {
        return res(
          ctx.json(response)
        );
      })
    );
	});

  let history;

  const renderWithMock = async () => {
    history = await mockRender(<MockFeed/>, "/feed");
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

  it("Check displays and error when there is an issue fetching the feed", async () => {
    server.use(
      rest.get(`${process.env.REACT_APP_URL}/feed`, (req, res, ctx) => {
        return res(
          ctx.status(400),
          ctx.json({})
        );
      })
    );
    await renderWithMock();
    const errorMessage = await screen.findByText(/error/i)
    expect(errorMessage).toBeInTheDocument();
  })
})
