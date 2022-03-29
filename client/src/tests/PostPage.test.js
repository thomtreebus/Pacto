import { render, screen, fireEvent } from "@testing-library/react";
import { waitForElementToBeRemoved } from "@testing-library/react"
import PostPage from "../pages/PostPage";
import "@testing-library/jest-dom";
import MockComponent from "./utils/MockComponent";
import { setupServer } from "msw/node";
import { createMemoryHistory } from 'history';
import { rest } from "msw";
import { Router, Route } from "react-router-dom";
import users from "./utils/testUsers";
import { useMockServer } from "./utils/useMockServer";

const post = {message:{
  text: "lorem ispum",
  type: "text",
  _id: 1,
  pact: {_id:5, moderators : []},
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
    upvoters: [],
    downvoters: [],
    votes: 0,
    createdAt: "5/5/5",
    text: "lorem ipsum stuff",
    _id: 1,
    childComments: []
  }],
  createdAt: "5/5/5",
}};

describe("PostPage Tests", () => {
  const server = useMockServer();

	beforeEach(async () => {
		server.use(
      rest.get(`${process.env.REACT_APP_URL}/pact/5/post/1`, (req, res, ctx) => {
        return res(ctx.json(post));
      }),
    );
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
    it("should open box for adding comment when Add comment is clicked", async () => {
      const reply = await screen.findByTestId("comment-adder");
      expect(reply.innerHTML).toContain("Add comment");
      fireEvent.click(reply);
      expect(reply.innerHTML).toContain("Hide");
      const replyBox = await screen.findByTestId("comment-reply-box");
      expect(replyBox).toBeDefined();
    });
    
    it("comment box should close when re-pressed", async () => {
      const reply = await screen.findByTestId("comment-adder");
      fireEvent.click(reply);
      fireEvent.click(reply);

      expect(reply.innerHTML).toContain("Add comment");
      const replyBox = await screen.queryByTestId("comment-reply-box");
      expect(replyBox).toBeNull();
    });
  });
});
