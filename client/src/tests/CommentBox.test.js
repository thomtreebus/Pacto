import { render, screen, fireEvent } from "@testing-library/react";
import { waitForElementToBeRemoved } from "@testing-library/react"
import CommentBox from "../components/CommentBox";
import "@testing-library/jest-dom";
import MockComponent from "./utils/MockComponent";
import { setupServer } from "msw/node";
import { rest } from "msw";

const COMMENT_TEXT = "amet officia molestias esse!";

const mockSuccessHandler = jest.fn((msg) => {
  expect(msg.text).toEqual(COMMENT_TEXT);
  return msg;
});

const comment = {
  pact: 5,
  post: {
    text: "lorem ispum",
    type: "text",
    _id: 1,
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
  childComments: [0,0,0,0],
  parentComment: undefined,
  _id: 1
}

describe("CommentCard Tests", () => {
  const server = setupServer(
		rest.get(`${process.env.REACT_APP_URL}/me`, (req, res, ctx) => {
			return res(
				ctx.json({ message: { firstName: "pac", lastName: "to", _id: "5" }, errors: [] })
			);
		}),
    rest.post(`${process.env.REACT_APP_URL}/pact/5/post/1/comment/1/reply`, (req, res, ctx) => {
			return res();
		}),
    rest.post(`${process.env.REACT_APP_URL}/pact/5/post/1/comment`, (req, res, ctx) => {
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
    const success = () => {
      return;
    }
		render(
      <MockComponent>
        <CommentBox post={comment.post} successHandler={mockSuccessHandler} />
      </MockComponent>
    );
    await waitForElementToBeRemoved(() => screen.getByText("Loading"));
	});

  describe("Check elements are rendered", () => {
    it("should render text entry component", async () => {
      await screen.findByTestId("text-entry-field");
    });

    it("should render submit button", async () => {
      await screen.findByTestId("submit-button");
    });
  });

  describe("Check interaction with elements", () => {
    it("should successfully submit comment", async () => {
      const submit = await screen.findByTestId("submit-button");
      const input = await screen.findByTestId("text-entry-field");
      fireEvent.change(input, { target: { value: COMMENT_TEXT } });
      fireEvent.click(submit);
      expect(mockSuccessHandler.mock.calls.length).toBe(1);
      expect(mockSuccessHandler.mock.calls[0].parentComment).toBe(undefined);
    });

    it("should successfully submit reply to comment", async () => {
      render(
        <MockComponent>
          <CommentBox post={comment.post} repliedToComment={comment} successHandler={mockSuccessHandler} />
        </MockComponent>
      );

      const submit = await screen.findByTestId("submit-button");
      const input = await screen.findByTestId("text-entry-field");
      fireEvent.change(input, { target: { value: COMMENT_TEXT } });
      fireEvent.click(submit);
      expect(mockSuccessHandler.mock.calls.length).toBe(1);
      expect(mockSuccessHandler.mock.calls[0].parentComment).toBe(comment);
    });
  });
});
