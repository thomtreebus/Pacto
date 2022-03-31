/**
 * Tests for the comment card component.
 */

import { screen, fireEvent } from "@testing-library/react";
import { waitFor } from "@testing-library/react"
import CommentCard, { DELETED_COMMENT_MESSAGE } from "../components/cards/CommentCard";
import "@testing-library/jest-dom";
import { rest } from "msw";
import users from "./utils/testUsers";
import { useMockServer } from "./utils/useMockServer";
import comments from "./utils/testComments";
import mockRender from "./utils/mockRender";

const COMMENT_TEXT = "amet officia molestias esse!";

let mockBeenCalled = false;
const mockSuccessHandler = () => {
  mockBeenCalled = true;
}

const comment = {
  post: {
    text: "lorem ispum",
    type: "text",
    _id: 1,
    comments: [],
    pact : { _id: 1 }
  },
  author: users[0],
  createdAt: Date.now(),
  text: COMMENT_TEXT,
  votes: 6,
  upvoters: [],
  downvoters: [],
  childComments: [],
  parentComment: undefined,
  _id: 1
}

describe("CommentCard Tests", () => {
  let history;
  const server = useMockServer(); 

  const renderWithMock = async (child=<CommentCard post={comment.post} comment={comment} postUpdaterFunc={mockSuccessHandler} />) => {
    history = await mockRender(child);
  }

  let postVoted;
  let replyPosted;
  beforeEach(async () => {
    postVoted = false;
    replyPosted = false;
    server.use(
      rest.delete(`${process.env.REACT_APP_URL}/pact/1/post/1/comment/1`, (req, res, ctx) => {
        const newComment = JSON.parse(JSON.stringify(comment));
        newComment.deleted = true;
        return res(
          ctx.json({ message: newComment, errors: [] })
        );
      }),
      rest.post(`${process.env.REACT_APP_URL}/pact/1/post/1/comment/1/reply`, (req, res, ctx) => {
        const newComment = comments[0];
        replyPosted = true;
        return res(
          ctx.json({ message: newComment, errors: [] })
        );
      }),
      rest.put(`${process.env.REACT_APP_URL}/pact/1/post/1/comment/1/upvote`, (req, res, ctx) => {
        postVoted=true;
        return res(
          ctx.json({})
        );
      }),
      rest.put(`${process.env.REACT_APP_URL}/pact/1/post/1/comment/1/downvote`, (req, res, ctx) => {
        postVoted=true;
        return res(
          ctx.json({})
        );
      })
    );
  });

  describe("Check elements are rendered", () => {
    beforeEach(async () => {
      await renderWithMock();
    });

    it("should render voter component", async () => {
      await screen.findByTestId("voter");
    });

    it("should render comment text", async () => {
      const text = await screen.findByText(COMMENT_TEXT);
      expect(text).toBeInTheDocument();
    });

    it("should render author text", async () => {
      const author = await screen.findByTestId("author");
      expect(author.innerHTML).toBe(users[0].firstName + " " + users[0].lastName);
    });

    it("should render date text", async () => {
      const date = await screen.findByTestId("author-date-line");
      expect(date.innerHTML).toContain("just now");
    });

    it("should render reply button", async () => {
      const reply = await screen.findByTestId("reply-button");
      expect(reply.innerHTML).toContain("Reply");
    });

    it("should render delete button", async () => {
      const del = await screen.findByTestId("delete-button");
      expect(del).toBeInTheDocument();
    });
  });

  describe("Check rendering special cases", () => {
    it("should not render delete button if not author or mod", async () => {
      server.use(
        rest.get(`${process.env.REACT_APP_URL}/me`, (req, res, ctx) => {
          return res(
            ctx.json({ message: users[1], errors: [] })
          );
        }),
      );
      await renderWithMock();
      const del = await screen.queryByTestId("delete-button");
      expect(del).toBeNull();
    });

    it("should render childComments if they exist", async () => {
      const commentWithChild = JSON.parse(JSON.stringify(comment));
      commentWithChild.childComments.push(comments[1]);
      commentWithChild.post.comments.push(comments[1]);

      await renderWithMock(<CommentCard post={commentWithChild.post} comment={commentWithChild} postUpdaterFunc={mockSuccessHandler} />);
      const replies = await screen.findByTestId("show-replies");
      fireEvent.click(replies);

      const commentCards = await screen.findAllByTestId("comment-card");
      expect(commentCards.length).toBe(2);
    });

    it("should render deleted comments correctly", async () => {
      const delComment = JSON.parse(JSON.stringify(comment));
      delComment.deleted = true;

      await renderWithMock(<CommentCard post={delComment.post} comment={delComment} postUpdaterFunc={mockSuccessHandler} />);
      await screen.findByText(DELETED_COMMENT_MESSAGE);
    });
  })

  describe("Check interaction with elements", () => {
    beforeEach(async () => {
      await renderWithMock();
    });

    it("should redirect to profile page when author text is clicked", async () => {
      const author = await screen.findByTestId("author");
      fireEvent.click(author);
      expect(history.location.pathname).toBe(`/user/${users[0]._id}`);
    });

    it("should open box for replying to comment when reply is clicked", async () => {
      const reply = await screen.findByTestId("reply-button");
      expect(reply.innerHTML).toContain("Reply");
      fireEvent.click(reply);
      expect(reply.innerHTML).toContain("Hide");
      const replyBox = await screen.findByTestId("comment-reply-box");
      expect(replyBox).toBeDefined();
    });
    
    it("reply box should close when re-pressed", async () => {
      const reply = await screen.findByTestId("reply-button");
      fireEvent.click(reply);
      fireEvent.click(reply);

      expect(reply.innerHTML).toContain("Reply");
      const replyBox = await screen.queryByTestId("comment-reply-box");
      expect(replyBox).toBeNull();
    });

    it("deletes comment successfully", async () => {
      const deleteBtn = await screen.findByTestId("delete-button");
      fireEvent.click(deleteBtn);

      expect(deleteBtn).toBeDisabled();

      await waitFor(() => expect(mockBeenCalled).toBe(true));
    });

    it("handles error when deleting comment", async () => {
      server.use(
        rest.delete(`${process.env.REACT_APP_URL}/pact/1/post/1/comment/1`, (req, res, ctx) => {
          return res(
            ctx.status(400),
            ctx.json({ message: null, errors: [{field: null, message: "Error"}] })
          );
        }),
      );
      const deleteBtn = await screen.findByTestId("delete-button");
      fireEvent.click(deleteBtn);

      expect(deleteBtn).toBeDisabled();

      await waitFor(() => expect(mockBeenCalled).toBe(true));
      await screen.findByTestId("snackbar");
    });

    it("handles error unhandled in backend when deleting comment", async () => {
      server.use(
        rest.delete(`${process.env.REACT_APP_URL}/pact/1/post/1/comment/1`, (req, res, ctx) => {
          return res(
            ctx.status(400),
            ctx.json({})
          );
        }),
      );
      const deleteBtn = await screen.findByTestId("delete-button");
      fireEvent.click(deleteBtn);

      expect(deleteBtn).toBeDisabled();

      await waitFor(() => expect(mockBeenCalled).toBe(true));
      await screen.findByTestId("snackbar");
    });

    it("comment voting callback function is called when comment is liked via Voter component", async () => {
      const likeBtn = await screen.findByTestId("ThumbUpRoundedIcon");
      fireEvent.click(likeBtn);

      await waitFor(() => expect(postVoted).toBe(true));
    });

    it("comment voting callback function is called when comment is disliked via Voter component", async () => {
      const dislikeBtn = await screen.findByTestId("ThumbDownRoundedIcon");
      fireEvent.click(dislikeBtn);

      await waitFor(() => expect(postVoted).toBe(true));
    });

    it("should create a new child comment when replied to", async () => {
      const COMMENT_TEXT = "hello";
      const reply = await screen.findByTestId("reply-button");
      fireEvent.click(reply);

      const input = await screen.findByRole("textbox", {
				name: "Comment",
			});
      fireEvent.change(input, { target: { value: COMMENT_TEXT } });

      const submit = await screen.findByTestId("submit-button");
      fireEvent.click(submit);

      await waitFor(() => expect(replyPosted).toBe(true))
      
    });
  });
});
  