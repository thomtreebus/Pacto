import { render, screen, fireEvent } from "@testing-library/react";
import { waitForElementToBeRemoved } from "@testing-library/react"
import PostPage from "../pages/PostPage";
import "@testing-library/jest-dom";
import MockComponent from "./utils/MockComponent";
import { setupServer } from "msw/node";
import { createMemoryHistory } from 'history';
import { rest } from "msw";
import { Router, Route } from "react-router-dom";

const post = {
  text: "lorem ispum",
  type: "text",
  _id: 1,
  pact: {_id:5},
  author: {
    firstName: "Krishi",
    lastName: "Wali",
    _id: 1
  },
  votes: 6,
  upvoters: [],
  downvoters: [],
  comments: [{
    author: {
      firstName: "Krishi",
      lastName: "Wali",
      _id: 1
    },
    text: "lorem ipsum stuff"
  }],
  createdAt: "5/5/5",
  _id: 1
};

describe("CommentBox Tests", () => {
  const server = setupServer(
		rest.get(`${process.env.REACT_APP_URL}/me`, (req, res, ctx) => {
			return res(
				ctx.json({ message: { firstName: "pac", lastName: "to", _id: "5" }, errors: [] })
			);
		}),
    rest.get(`${process.env.REACT_APP_URL}/pact/5/post/1`, (req, res, ctx) => {
			return res();
		}),
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

  beforeEach(async () => {
    const history = createMemoryHistory({ initialEntries: [`/pact/5/post/1`] });

    render(
      <MockComponent>
        <Router history={history}>
          <Route exact path="/pact/:pactID/post/:postID">
            <PostPage/>
          </Route>
          <Route exact path="/not-found">
            Not Found
          </Route>
        </Router>
      </MockComponent>
    );
    await waitForElementToBeRemoved(() => screen.getByText("Loading"));
	});

  describe("Check elements are rendered", () => {
    it("should render post card", async () => {
      await screen.findByTestId("card");
    });

    it("should render add comment button", async () => {
      await screen.findByTestId("comment-adder");
    });

    it("should render list of comments", async () => {
      await screen.findByTestId("comment-list");
      await screen.findByTestId("comment-card");
    });
  });

  describe("Check interaction with elements", () => {
    
  });
});
