/**
 * Tests for the post page.
 */

import {screen, fireEvent, waitFor} from "@testing-library/react";
import Post from "../../../../../pages/university/pact/post/Post";
import "@testing-library/jest-dom";
import { rest } from "msw";
import { Route } from "react-router-dom";
import users from "../../../../helpers/testUsers";
import pacts from "../../../../helpers/testPacts";
import comments from "../../../../helpers/testComments";
import { useMockServer } from "../../../../helpers/useMockServer";
import mockRender from "../../../../helpers/mockRender";

const post = {
  text: "lorem ispum",
  type: "text",
  _id: 1,
  pact: pacts[0],
  author: users[1],
  votes: 6,
  upvoters: [],
  downvoters: [],
  comments: [comments[0]],
  createdAt: "5/5/5",
};


const MockPostPage = () => {
  return (
  <>
    <Route exact path="/pact/:pactID/post/:postID">
      <Post/>
    </Route>
    <Route exact path="/not-found">
      Not Found
    </Route>
  </>
  )
}

describe("PostPage Tests", () => {
  const server = useMockServer();

  beforeEach(async () => {
    server.use(
      rest.post(`${process.env.REACT_APP_URL}/pact/1/post/1/comment/1/reply`, (req, res, ctx) => {
        const newComment = JSON.parse(JSON.stringify(comments[0]));
        newComment._id = 2;
        newComment.text = req.body.text;
        newComment.parentComment = {_id: comment._id}
        return res(
          ctx.status(201),
          ctx.json({
            message: newComment,
            errors: []
          })
        );
      }),
      rest.post(`${process.env.REACT_APP_URL}/pact/1/post/1/comment`, (req, res, ctx) => {
        const newComment = JSON.parse(JSON.stringify(comments[0]));
        newComment._id = 2;
        newComment.text = req.body.text;
        return res(
          ctx.status(201),
          ctx.json({
            message: newComment,
            errors: []
          })
        );
      }),
      rest.get(`${process.env.REACT_APP_URL}/pact/1/post/1`, (req, res, ctx) => {
        return res(
          ctx.json({ 
            message: post,
            errors: []
          })
        );
      }),
    );
  });

  const renderWithMock = async () => {
    const history = await mockRender(<MockPostPage/>, "/pact/1/post/1" );
  }

  describe("Check elements are rendered", () => {
    beforeEach(async () => {
      await renderWithMock();
    });

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

  describe("Check rendering/interaction as post author", () => {
    beforeEach(async () => {
      server.use(
        rest.get(`${process.env.REACT_APP_URL}/me`, (req, res, ctx) => {
          return res(
            ctx.json({ message: post.author, errors: [] })
          );
        }),
      );
      await renderWithMock();
    });

    it("should render delete button", async () => {
      await screen.findByTestId("delete-button");
    });
  });

  describe("Check interaction with elements", () => {
    beforeEach(async () => {
      await renderWithMock();
    });

    it("should open box for adding comment when Add comment is clicked", async () => {
      const reply = await screen.findByTestId("comment-adder");
      expect(reply.innerHTML).toContain("Add comment");
      fireEvent.click(reply);
      await waitFor(() => expect(screen.findByTestId("comment-reply-box")).not.toBe({}))
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

    it("should handle callback from 'top level' commentBox", async () => {
      const COMMENT_TEXT = "hello";

      const addCommentBtn = await screen.findByText("Add comment");
      fireEvent.click(addCommentBtn);
      const input = await screen.findByRole("textbox", {
				name: "Comment",
			});
      fireEvent.change(input, { target: { value: COMMENT_TEXT } });

      const submit = await screen.findByTestId("submit-button");
      fireEvent.click(submit);
      await waitFor(() => expect(submit).not.toBeDisabled())
      await waitFor(() => expect(input).not.toBeInTheDocument());

      const commentCards = await screen.findAllByTestId("comment-card");
      expect(commentCards.length).toBe(2);
    });
  });

  describe("Misc. tests", () => {
    it("Redirects to 404 on missing post", async () => {
      server.use(
        rest.get(`${process.env.REACT_APP_URL}/pact/1/post/1`, (req, res, ctx) => {
          return res(
            ctx.status(400),
            ctx.json({ 
              message: null,
              errors: []
            })
          );
        }),
      );
      await renderWithMock();
      await screen.findAllByText(/Not found/i);
    });
  });
});
