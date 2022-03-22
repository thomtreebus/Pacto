import { render, screen, fireEvent } from "@testing-library/react";
import { waitForElementToBeRemoved } from "@testing-library/react"
import BasePostCard from "../components/cards/BasePostCard";
import "@testing-library/jest-dom";
import MockComponent from "./utils/MockComponent";
import { setupServer } from "msw/node";
import { rest } from "msw";

const post = {
  pact: 5,
  author: {
    firstName: "Krishi",
    lastName: "Wali",
    _id: 1
  },
  createdAt: new Date(Date.now() - (86400000) * 0).toISOString(),
  title: "ipsumLorem ipsumLorem ipsumLorem ipsumLorem",
  text: "amet officia molestias esse!",
  type: "text",
  votes: 6,
  upvoters: [],
  downvoters: [],
  comments: [0,0,0,0],
  _id: 1
}

describe("BasePostCard Tests", () => {
  const server = setupServer(
		rest.get(`${process.env.REACT_APP_URL}/me`, (req, res, ctx) => {
			return res(
				ctx.json({ message: { firstName: "pac", lastName: "to", _id: "5" }, errors: [] })
			);
		}),
    rest.put(`${process.env.REACT_APP_URL}/pact/5/post/upvote/1`, (req, res, ctx) => {
			return res();
		}),
    rest.put(`${process.env.REACT_APP_URL}/pact/5/post/downvote/1`, (req, res, ctx) => {
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
        <BasePostCard post={post} />
      </MockComponent>
    );
    await waitForElementToBeRemoved(() => screen.getByText("Loading"));
	});

  describe("Check elements are rendered", () => {
    it("should render upvote button", async () => {
      await screen.findByTestId("ThumbUpRoundedIcon");
    });

    it("should render downvote button", async () => {
      await screen.findByTestId("ThumbDownRoundedIcon");
    });

    it("should render vote number", async () => {
      const likes = await screen.findByTestId("likes");
      expect(likes.innerHTML).toBe("6");
    });

    it("should render post title", async () => {
      const title = await screen.findByTestId("title");
      expect(title.innerHTML).toBe("ipsumLorem ipsumLorem ipsumLorem ipsumLorem");
    });

    it("should render author text", async () => {
      const author = await screen.findByTestId("author");
      expect(author.innerHTML).toBe("Krishi Wali");
    });

    it("should render date text", async () => {
      const date = await screen.findByTestId("author-date-line");
      expect(date.innerHTML).toContain("just now");
    });

    it("should render comments number with plural for greater than 1", async () => {
      const comments = await screen.findByTestId("comments");
      expect(comments.innerHTML).toContain("4 Comments");
    });

    it("should render comments number with singular for 1", async () => {
      document.body.innerHTML = "";
      const postCopy = {...post};
      postCopy.comments = [0];
      render(
        <MockComponent>
          <BasePostCard post={postCopy} />
        </MockComponent>
      );
      const comments = await screen.findByTestId("comments");
      expect(comments.innerHTML).toContain("1 Comment");
    });

    it("should render comment icon", async () => {
      await screen.findByTestId("CommentIcon");
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

    it("should keep votes the same when upvote button pressed twice", async () => {
      const upvote = await screen.findByTestId("ThumbUpRoundedIcon");
      fireEvent.click(upvote);
      fireEvent.click(upvote);
      const likes = screen.getByTestId("likes");
      expect(likes.innerHTML).toBe("6");
    });

    it("should keep votes the same when downvote button pressed twice", async () => {
      const downvote = await screen.findByTestId("ThumbDownRoundedIcon");
      fireEvent.click(downvote);
      fireEvent.click(downvote);
      const likes = screen.getByTestId("likes");
      expect(likes.innerHTML).toBe("6");
    });

    it("should decrement votes when upvote button is pressed followed by downvote button", async () => {
      const upvote = await screen.findByTestId("ThumbUpRoundedIcon");
      const downvote = await screen.findByTestId("ThumbDownRoundedIcon");
      fireEvent.click(upvote);
      fireEvent.click(downvote);
      const likes = screen.getByTestId("likes");
      expect(likes.innerHTML).toBe("5");
    })

    it("should increment votes when downvote button is pressed followed by upvote button", async () => {
      const upvote = await screen.findByTestId("ThumbUpRoundedIcon");
      const downvote = await screen.findByTestId("ThumbDownRoundedIcon");
      fireEvent.click(downvote);
      fireEvent.click(upvote);
      const likes = screen.getByTestId("likes");
      expect(likes.innerHTML).toBe("7");
    })

    it("should redirect to profile page when author text is clicked", async () => {
      const author = await screen.findByTestId("author");
      fireEvent.click(author);
      expect(window.location.pathname).toBe("/user/1");
    });
  });
});
