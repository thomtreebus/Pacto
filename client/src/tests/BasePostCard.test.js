/**
 * Tests for the base post card component which wraps the different types
 * of existing posts. 
 */

import { screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import BasePostCard from "../components/cards/BasePostCard";
import "@testing-library/jest-dom";
import { useMockServer } from "./utils/useMockServer";
import mockRender from "./utils/mockRender";
import { rest } from "msw";
import users from "./utils/testUsers";

const post = {
  pact: {
    _id : 5,
    moderators: [users[1]._id]
  },
  author: users[0],
  createdAt: new Date(Date.now()).toISOString(),
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
  let postVoted;
  let history;
  const server = useMockServer();

  beforeEach(async () => {
    server.use(
      rest.put(`${process.env.REACT_APP_URL}/pact/5/post/downvote/1`, (req, res, ctx) => {
        postVoted=true;
        return res(
          ctx.json({})
        );
      }),
      rest.put(`${process.env.REACT_APP_URL}/pact/5/post/upvote/1`, (req, res, ctx) => {
        postVoted=true;
        return res(
          ctx.json({})
        );
      }),
      rest.delete(`${process.env.REACT_APP_URL}/pact/5/post/1`, (req, res, ctx) => {
        return res(
          ctx.status(204),
          ctx.json({})
        );
      }),
    )
  });

  beforeEach(async () => {
    postVoted = false;    
		history = await mockRender(<BasePostCard post={post} />);
	});

  describe("Check elements are rendered", () => {
    it("should render voter component", async () => {
      await screen.findByTestId("voter");
    });

    it("should render post title", async () => {
      const title = await screen.findByTestId("title");
      expect(title.innerHTML).toBe("ipsumLorem ipsumLorem ipsumLorem ipsumLorem");
    });

    it("should render author text", async () => {
      const author = await screen.findByTestId("author");
      expect(author.innerHTML).toBe(`${users[0].firstName} ${users[0].lastName}`);
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
      cleanup();
      const postCopy = {...post};
      postCopy.comments = [0];
      history = await mockRender(<BasePostCard post={postCopy} />);
      const comments = await screen.findByTestId("comments");
      expect(comments.innerHTML).toContain("1 Comment");
    });

    it("should render pact name if showPact is true", async () => {
      cleanup();
      history = await mockRender(<BasePostCard post={post} showPact={true}/>);
      await screen.findByTestId("pact");
    });

    it("should render comment icon", async () => {
      await screen.findByTestId("CommentIcon");
    });

    it("should render delete button if author", async () => {
      const del = await screen.findByTestId("delete-button");
      expect(del).toBeInTheDocument();
    });
  });

  describe("Check rendering special cases", () => {
    beforeEach(async () => {
      cleanup();
    })

    it("should render delete button if moderator", async () => {
      server.use(
        rest.get(`${process.env.REACT_APP_URL}/me`, (req, res, ctx) => {
          return res(
            ctx.json({ message: users[1], errors: [] })
          );
        }),
      );
      history = await mockRender(<BasePostCard post={post} />);
      const del = await screen.findByTestId("delete-button");
      expect(del).toBeInTheDocument();
    });

    it("should not render delete button if not author or mod", async () => {
      server.use(
        rest.get(`${process.env.REACT_APP_URL}/me`, (req, res, ctx) => {
          return res(
            ctx.json({ message: users[3], errors: [] })
          );
        }),
      );
      history = await mockRender(<BasePostCard post={post} />);
      const del = screen.queryByTestId("delete-button");
      expect(del).toBeNull();
    });
  });

  describe("Check interaction with elements", () => {
    it("should redirect to profile page when author text is clicked", async () => {
      const author = await screen.findByTestId("author");
      fireEvent.click(author);
      expect(history.location.pathname).toBe("/user/1");
    });

    it("should redirect to post page when title text is clicked", async () => {
      const title = await screen.findByTestId("title");
      fireEvent.click(title);
      expect(history.location.pathname).toBe("/pact/5/post/1");
    });

    it("should redirect to post page when comments text is clicked", async () => {
      const comments = await screen.findByTestId("comments");
      fireEvent.click(comments);
      expect(history.location.pathname).toBe("/pact/5/post/1");
    });

    it("a request is sent when the post is liked via Voter component", async () => {
      const likeBtn = await screen.findByTestId("ThumbUpRoundedIcon");
      fireEvent.click(likeBtn);

      await waitFor(() => expect(postVoted).toBe(true));
    });

    it("a request is sent when the post is disliked via Voter component", async () => {
      const dislikeBtn = await screen.findByTestId("ThumbDownRoundedIcon");
      fireEvent.click(dislikeBtn);

      await waitFor(() => expect(postVoted).toBe(true));
    });

    it("deletes the post successfully", async () => {
      const deleteBtn = await screen.findByTestId("delete-button");
      fireEvent.click(deleteBtn);
      expect(deleteBtn).toBeDisabled();
      await waitFor(() => expect(history.location.pathname).toBe(`/pact/${post.pact._id}`))
    });

    it("displays errors when an error is returned when deleting a post", async () => {
      const returnedError = "Error";
      server.use(
        rest.delete(`${process.env.REACT_APP_URL}/pact/5/post/1`, (req, res, ctx) => {
          return res(
            ctx.status(400),
            ctx.json({ message: null, errors: [{field: null, message: returnedError}] })
          );
        }),
      );
      const deleteBtn = await screen.findByTestId("delete-button");
      fireEvent.click(deleteBtn);
      expect(deleteBtn).toBeDisabled();
      const errorMessage = await screen.findByText(returnedError);
      expect(errorMessage).toBeInTheDocument();
    });

    it("displays server error when status not successful but no error returned", async () => {
      server.use(
        rest.delete(`${process.env.REACT_APP_URL}/pact/5/post/1`, (req, res, ctx) => {
          return res(
            ctx.status(400),
            ctx.json({})
          );
        }),
      );
      const deleteBtn = await screen.findByTestId("delete-button");
      fireEvent.click(deleteBtn);
      expect(deleteBtn).toBeDisabled();
      const errorMessage = await screen.findByText(/server error/i);
      expect(errorMessage).toBeInTheDocument();
    });

    it("should redirect to pact if pact name is clicked", async () => {
      cleanup();
      history = await mockRender(<BasePostCard post={post} showPact={true}/>);
      const pactName = await screen.findByTestId("pact");
      fireEvent.click(pactName);
      expect(history.location.pathname).toBe("/pact/5");
    });
  });
});
