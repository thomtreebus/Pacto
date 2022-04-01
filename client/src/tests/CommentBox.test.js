/**
 * Tests for the comment box which is added when the user want to add a new comment.
 */

import { screen, fireEvent, waitFor } from "@testing-library/react";
import CommentBox from "../components/CommentBox";
import "@testing-library/jest-dom";
import { rest } from "msw";
import { useMockServer } from "./utils/useMockServer";
import mockRender from "./utils/mockRender";

const COMMENT_TEXT = "amet officia molestias esse!";

let mockBeenCalled = false;
let parameterReceivedByMock = null;
const mockSuccessHandler = (msg) => {
  expect(msg.text).toEqual(COMMENT_TEXT);
  parameterReceivedByMock = msg;
  mockBeenCalled = true;
}

const comment = {
  pact: {_id:5},
  post: {
    text: "lorem ispum",
    type: "text",
    _id: 1,
    pact: {_id:5},
    comments: []
  },
  author: {
    firstName: "Krishi",
    lastName: "Wali",
    _id: 1
  },
  createdAt: "5/5/5",
  text: "lorem ipsum blah blah blah",
  votes: 6,
  upvoters: [],
  downvoters: [],
  childComments: [],
  parentComment: undefined,
  _id: 1
}

describe("CommentBox Tests", () => {
  const server = useMockServer();

	beforeEach(async () => {
		server.use(
      rest.post(`${process.env.REACT_APP_URL}/pact/5/post/1/comment/1/reply`, (req, res, ctx) => {
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
      rest.post(`${process.env.REACT_APP_URL}/pact/5/post/1/comment`, (req, res, ctx) => {
        return res(
          ctx.status(201),
          ctx.json({
            message: {text: req.body.text},
            errors: []
          })
        );
      }),
    );
	});

  beforeEach(async () => {
    parameterReceivedByMock = null
    mockBeenCalled = false;
	});

  describe("Check elements are rendered", () => {
    beforeEach( async() => {
      await mockRender(<CommentBox post={comment.post} successHandler={mockSuccessHandler} />);
    })
    it("should render text entry component", async () => {
      await screen.findByTestId("text-entry-field");
    });

    it("should render submit button", async () => {
      await screen.findByTestId("submit-button");
    });
  });

  describe("Check interaction with elements", () => {
    it("should successfully submit comment", async () => {
      await mockRender(<CommentBox post={comment.post} successHandler={mockSuccessHandler} />);
      const submit = await screen.findByTestId("submit-button");
      const input = await screen.findByRole("textbox", {
				name: "Comment",
			});

      expect(mockBeenCalled).toBe(false);

      fireEvent.change(input, { target: { value: COMMENT_TEXT } });
      fireEvent.click(submit);

      await waitFor(() => expect(mockBeenCalled).toBe(true));
      expect(parameterReceivedByMock.parentComment).toBeUndefined();
    });

    it("should successfully submit reply to comment", async () => {
      await mockRender(<CommentBox post={comment.post} repliedToComment={comment} successHandler={mockSuccessHandler} />);
      const submit = await screen.findByTestId("submit-button");
      const input = await screen.findByRole("textbox", {
				name: "Comment",
			});

      expect(mockBeenCalled).toBe(false);

      fireEvent.change(input, { target: { value: COMMENT_TEXT } });
      fireEvent.click(submit);

      await waitFor(() => expect(mockBeenCalled).toBe(true));
      expect(parameterReceivedByMock.parentComment._id).toBe(comment._id);
    });

    it("should provide error when invalid comment is submitted", async () => {
      server.use(
        rest.post(`${process.env.REACT_APP_URL}/pact/5/post/1/comment`, (req, res, ctx) => {
          return res(
            ctx.status(400),
            ctx.json({
              message: null,
              errors: [
                {field: "text", message: "Comment text is required"}
              ]
            })
          );
        }),
      );
      await mockRender(<CommentBox post={comment.post} successHandler={mockSuccessHandler} />);
      const input = await screen.findByRole("textbox", {
				name: "Comment",
			});
      const submit = await screen.findByTestId("submit-button");
      // Not making any input

      expect(mockBeenCalled).toBe(false);

      fireEvent.click(submit);

      await waitFor(() => expect(submit).not.toBeDisabled());

      const errorMsg = await screen.queryByText("Comment text is required");
      expect(errorMsg).toBeInTheDocument();

      expect(mockBeenCalled).toBe(false);
    });
  });
});
