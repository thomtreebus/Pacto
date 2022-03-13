import { render, screen, fireEvent } from "@testing-library/react";
import { waitForElementToBeRemoved } from "@testing-library/react"
import BasePostCard from "../components/cards/BasePostCard";
import "@testing-library/jest-dom";
import MockComponent from "./utils/MockComponent";
import { setupServer } from "msw/node";
import { rest } from "msw";

const post = {
  pact: {
    _id: 5
  },
  author: {
    firstName: "Krishi",
    lastName: "Wali",
    _id: 1
  },
  date: "5/5/5",
  title: "ipsumLorem ipsumLorem ipsumLorem ipsumLorem",
  text: "amet officia molestias esse!",
  type: "text",
  votes: 6,
  upvoted: false,
  downvoted: false,
  comments: [0,0,0,0],
  _id: 1
}

describe("BasePostCard Tests", () => {
  const server = setupServer(
		rest.get(`${process.env.REACT_APP_URL}/me`, (req, res, ctx) => {
			return res(
				ctx.json({ message: { firstName: "pac", lastName: "to" }, errors: [] })
			);
		}),
    rest.post(`${process.env.REACT_APP_URL}/pact/5/post/upvote/1`, (req, res, ctx) => {
			return res();
		}),
    rest.post(`${process.env.REACT_APP_URL}/pact/5/post/downvote/1`, (req, res, ctx) => {
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
		render(
      <MockComponent>
        <BasePostCard post={post} />;
      </MockComponent>);
      await waitForElementToBeRemoved(() => screen.getByText("Loading"));
	});

  describe("Check elements are rendered", () => {
    it("should render upvote button", () => {
      screen.getByTestId("ThumbUpRoundedIcon");
    });

    it("should render downvote button", () => {
      screen.getByTestId("ThumbDownRoundedIcon");
    });

    it("should render vote number", () => {
      const likes = screen.getByTestId("likes");
      expect(likes.innerHTML).toBe("6");
    });

    it("should render post title", () => {
      const title = screen.getByTestId("title");
      expect(title.innerHTML).toBe("ipsumLorem ipsumLorem ipsumLorem ipsumLorem");
    });

    it("should render author text", () => {
      const author = screen.getByTestId("author");
      expect(author.innerHTML).toBe("Krishi Wali");
    });

    it("should render date text", () => {
      const date = screen.getByTestId("author-date-line");
      expect(date.innerHTML).toContain("5/5/5");
    });

    it("should render comments number with plural for greater than 1", () => {
      const comments = screen.getByTestId("comments");
      expect(comments.innerHTML).toContain("4 Comments");
    });

    it("should render comments number with singular for 1", () => {
      document.body.innerHTML = "";
      const postCopy = {...post};
      postCopy.comments = [0];
      render(< BasePostCard post={postCopy} />)
      const comments = screen.getByTestId("comments");
      expect(comments.innerHTML).toContain("1 Comment");
    });

    it("should render comment icon", () => {
      screen.getByTestId("CommentIcon");
    });
  });

  describe("Check interaction with elements", () => {
    it("should increment votes when upvote button pressed", () => {
      fireEvent.click(screen.getByTestId("ThumbUpRoundedIcon"));
      const likes = screen.getByTestId("likes");
      expect(likes.innerHTML).toBe("7");
    });

    it("should decrement votes when downvote button pressed", () => {
      fireEvent.click(screen.getByTestId("ThumbDownRoundedIcon"));
      const likes = screen.getByTestId("likes");
      expect(likes.innerHTML).toBe("5");
    });

    it("should keep votes the same when upvote button pressed twice", () => {
      const upvote = screen.getByTestId("ThumbUpRoundedIcon");
      fireEvent.click(upvote);
      fireEvent.click(upvote);
      const likes = screen.getByTestId("likes");
      expect(likes.innerHTML).toBe("6");
    });

    it("should keep votes the same when downvote button pressed twice", () => {
      const downvote = screen.getByTestId("ThumbDownRoundedIcon");
      fireEvent.click(downvote);
      fireEvent.click(downvote);
      const likes = screen.getByTestId("likes");
      expect(likes.innerHTML).toBe("6");
    });

    it("should decrement votes when upvote button is pressed followed by downvote button", () => {
      const upvote = screen.getByTestId("ThumbUpRoundedIcon");
      const downvote = screen.getByTestId("ThumbDownRoundedIcon");
      fireEvent.click(upvote);
      fireEvent.click(downvote);
      const likes = screen.getByTestId("likes");
      expect(likes.innerHTML).toBe("5");
    })

    it("should increment votes when downvote button is pressed followed by upvote button", () => {
      const upvote = screen.getByTestId("ThumbUpRoundedIcon");
      const downvote = screen.getByTestId("ThumbDownRoundedIcon");
      fireEvent.click(downvote);
      fireEvent.click(upvote);
      const likes = screen.getByTestId("likes");
      expect(likes.innerHTML).toBe("7");
    })

    it("should redirect to profile page when author text is clicked", () => {
      const author = screen.getByTestId("author");
      fireEvent.click(author);
      expect(window.location.pathname).toBe("/user/1");
    });
  });
});
