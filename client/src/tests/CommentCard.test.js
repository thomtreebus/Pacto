import { render, screen, fireEvent } from "@testing-library/react";
import { waitForElementToBeRemoved, waitFor } from "@testing-library/react"
import CommentCard, { DELETED_COMMENT_MESSAGE } from "../components/cards/CommentCard";
import "@testing-library/jest-dom";
import MockComponent from "./utils/MockComponent";
import { rest } from "msw";
import users from "./utils/testUsers";
import { useMockServer } from "./utils/useMockServer";
import comments from "./utils/testComments";

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
  const server = useMockServer(); 

  const renderWithMock = async (child=<CommentCard post={comment.post} comment={comment} postUpdaterFunc={mockSuccessHandler} />) => {
    render(
      <MockComponent>
        {child}
      </MockComponent>
    );

    await waitForElementToBeRemoved(() => screen.getByText("Loading"));
  }

  let postVoted;
  beforeEach(async () => {
    postVoted = false;
    server.use(
      rest.delete(`${process.env.REACT_APP_URL}/pact/1/post/1/comment/1`, (req, res, ctx) => {
        const newComment = JSON.parse(JSON.stringify(comment));
        newComment.deleted = true;
        return res(
          ctx.json({ message: newComment, errors: [] })
        );
      }),
      rest.post(`${process.env.REACT_APP_URL}/pact/1/post/1/comment/1/reply`, (req, res, ctx) => {
        const newComment = comments[0]
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

  describe("Check rendering non-author case", () => {
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
  })

  describe("Check interaction with elements", () => {
    beforeEach(async () => {
      await renderWithMock();
    });

    it("should redirect to profile page when author text is clicked", async () => {
      const author = await screen.findByTestId("author");
      fireEvent.click(author);
      expect(window.location.pathname).toBe(`/user/${users[0]._id}`);
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

      await waitFor(() => expect(submit).not.toBeDisabled())
      await waitFor(() => expect(input).not.toBeInTheDocument());

      await screen.findByText("Show replies");
    });
  });
});
