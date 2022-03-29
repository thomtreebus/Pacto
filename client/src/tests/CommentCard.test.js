import { render, screen, fireEvent } from "@testing-library/react";
import { waitForElementToBeRemoved } from "@testing-library/react"
import CommentCard from "../components/cards/CommentCard";
import "@testing-library/jest-dom";
import MockComponent from "./utils/MockComponent";
import { setupServer } from "msw/node";
import { rest } from "msw";
import users from "./utils/testUsers";
import { useMockServer } from "./utils/useMockServer";

const COMMENT_TEXT = "amet officia molestias esse!";

const comment = {
  pact: 5,
  post: {
    text: "lorem ispum",
    type: "text",
    _id: 1,
    comments: [],
    pact : {
      moderators : []
    }
  },
  author: {
    firstName: "Krishi",
    lastName: "Wali",
    _id: 1
  },
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

  beforeEach(async () => {
		render(
      <MockComponent>
        <CommentCard post={comment.post} comment={comment} postUpdaterFunc={()=>{}} />
      </MockComponent>
    );
    await waitForElementToBeRemoved(() => screen.getByText("Loading"));
	});

  describe("Check elements are rendered", () => {
    it("should render voter component", async () => {
      await screen.findByTestId("voter");
    });

    it("should render comment text", async () => {
      const text = await screen.findByTestId("comment-text");
      expect(text.innerHTML).toBe(COMMENT_TEXT);
    });

    it("should render author text", async () => {
      const author = await screen.findByTestId("author");
      expect(author.innerHTML).toBe("Krishi Wali");
    });

    it("should render date text", async () => {
      const date = await screen.findByTestId("author-date-line");
      expect(date.innerHTML).toContain("just now");
    });

    it("should render reply button", async () => {
      const reply = await screen.findByTestId("reply-button");
      expect(reply.innerHTML).toContain("Reply");
    });
  });

  describe("Check interaction with elements", () => {
    it("should redirect to profile page when author text is clicked", async () => {
      const author = await screen.findByTestId("author");
      fireEvent.click(author);
      expect(window.location.pathname).toBe("/user/1");
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
  });
});
