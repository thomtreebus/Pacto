import { render, screen, fireEvent, waitFor, findByText } from "@testing-library/react";
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

const post = { message:{
  text: "lorem ispum",
  type: "text",
  _id: 1,
  pact: {_id:1, moderators : []},
  author: users[1],
  votes: 6,
  upvoters: [],
  downvoters: [],
  comments: [{
    author: users[0],
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
  server.use(
    rest.post(`${process.env.REACT_APP_URL}/pact/1/post/1/comment/1/reply`, (req, res, ctx) => {
			return res(
        ctx.status(201),
        ctx.json({
          message: {
            text: req.body.text,
            parentComment: {_id:comment._id}
          },
          errors: []
        })
      );
		}),
    rest.post(`${process.env.REACT_APP_URL}/pact/1/post/1/comment`, (req, res, ctx) => {
      return res(
        ctx.status(201),
        ctx.json({
          message: {text: req.body.text},
          errors: []
        })
      );
		}),
    rest.get(`${process.env.REACT_APP_URL}/pact/1/post/1`, (req, res, ctx) => {
      return res(ctx.json(post));
    }),
	);

  beforeEach(async () => {
    const history = createMemoryHistory({ initialEntries: [`/pact/1/post/1`] });

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

    it("should handle callback from own CommentBox", async () => {
      const COMMENT_TEXT = "lorem ipsum";

      const addCommentBtn = await screen.findByText("Add comment");
      fireEvent.click(addCommentBtn);

      const submit = await screen.findByTestId("submit-button");
      const input = await screen.findByRole("textbox", {
				name: "Comment",
			});

      fireEvent.change(input, { target: { value: COMMENT_TEXT } });
      fireEvent.click(submit);

      await waitFor(() => expect(submit).toBeDisabled());
      const newComment = await findByText(COMMENT_TEXT);
      expect(newComment).toBeInTheDocument();
    });

    it("should handle callback from a comment's CommentBox", async () => {
      const COMMENT_TEXT = "lorem ipsum";

      const reply = await screen.findByText("Reply");
      fireEvent.click(reply);

      const submit = await screen.findByTestId("submit-button");
      const input = await screen.findByRole("textbox", {
				name: "Comment",
			});

      fireEvent.change(input, { target: { value: COMMENT_TEXT } });
      fireEvent.click(submit);

      await waitFor(() => expect(reply).not.toBeInTheDocument());
      const newComment = await findByText(COMMENT_TEXT);
      expect(newComment).toBeInTheDocument();
    });
  });
});
