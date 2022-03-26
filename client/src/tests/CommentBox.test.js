import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { waitForElementToBeRemoved } from "@testing-library/react"
import CommentBox from "../components/CommentBox";
import "@testing-library/jest-dom";
import MockComponent from "./utils/MockComponent";
import { setupServer } from "msw/node";
import { rest } from "msw";

const COMMENT_TEXT = "amet officia molestias esse!";

const mockSuccessHandler = jest.fn((msg) => {
  console.log("AH!")
  expect(msg.text).toEqual(COMMENT_TEXT);
  return msg;
});

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
  const server = setupServer(
		rest.get(`${process.env.REACT_APP_URL}/me`, (req, res, ctx) => {
			return res(
				ctx.json({ message: { firstName: "pac", lastName: "to", _id: "5" }, errors: [] })
			);
		}),
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
    mockSuccessHandler.mockReset();
	});

  const renderWithMock = async (element) => {
    render(
      <MockComponent>
        { element }
      </MockComponent>
    );
    await waitForElementToBeRemoved(() => screen.getByText("Loading"));
  }

  describe("Check elements are rendered", () => {
    beforeEach( async() => {
      await renderWithMock(<CommentBox post={comment.post} successHandler={mockSuccessHandler} />);
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
      await renderWithMock(<CommentBox post={comment.post} successHandler={mockSuccessHandler} />);
      const submit = await screen.findByTestId("submit-button");
      const input = await screen.findByRole("textbox", {
				name: "Comment",
			});
      fireEvent.change(input, { target: { value: COMMENT_TEXT } });
      fireEvent.click(submit);
      await waitFor(() => expect(mockSuccessHandler).toHaveBeenCalled());
      expect(mockSuccessHandler.mock.calls.length).toBe(1);
      expect(mockSuccessHandler.mock.calls[0].parentComment).toBe(undefined);
    });

    it("should successfully submit reply to comment", async () => {
      await renderWithMock(<CommentBox post={comment.post} repliedToComment={comment} successHandler={mockSuccessHandler} />)
      const submit = await screen.findByTestId("submit-button");
      const input = await screen.findByRole("textbox", {
				name: "Comment",
			});
      fireEvent.change(input, { target: { value: COMMENT_TEXT } });
      fireEvent.click(submit);
      await waitFor(() => expect(mockSuccessHandler).toHaveBeenCalled());
      expect(mockSuccessHandler.mock.calls.length).toBe(1);
      expect(mockSuccessHandler.mock.calls[0].parentComment._id).toBe(comment._id);
    });
  });
});
