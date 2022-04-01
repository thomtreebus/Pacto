/**
 * Tests for the basee post card componnent which wraps the the different types
 * of existing posts. 
 */

import { render, screen, fireEvent } from "@testing-library/react";
import BasePostCard from "../components/cards/BasePostCard";
import "@testing-library/jest-dom";
import MockComponent from "./utils/MockComponent";
import { useMockServer } from "./utils/useMockServer";
import mockRender from "./utils/mockRender";

const post = {
  pact: {
    _id : 5,
    moderators: []
  },
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

const MockBasePostCard = () => {
  return (
    <MockComponent>
      <BasePostCard post={post} />
    </MockComponent>
  )
}

describe("BasePostCard Tests", () => {
  const server = useMockServer();

  beforeEach(async () => {
		await mockRender(<MockBasePostCard/>);
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
      document.body.innerHTML = ""; // clear render
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

    it("should render pact name if showPact is true", async () => {
      document.body.innerHTML = ""; // clear render
      render(
        <MockComponent>
          <BasePostCard post={post} showPact={true}/>
        </MockComponent>
      );
      await screen.findByTestId("pact");
    });

    it("should render comment icon", async () => {
      await screen.findByTestId("CommentIcon");
    });
  });

  describe("Check interaction with elements", () => {
    it("should redirect to profile page when author text is clicked", async () => {
      const author = await screen.findByTestId("author");
      fireEvent.click(author);
      expect(window.location.pathname).toBe("/user/1");
    });

    it("should redirect to post page when title text is clicked", async () => {
      const title = await screen.findByTestId("title");
      fireEvent.click(title);
      expect(window.location.pathname).toBe("/pact/5/post/1");
    });

    it("should redirect to post page when comments text is clicked", async () => {
      const comments = await screen.findByTestId("comments");
      fireEvent.click(comments);
      expect(window.location.pathname).toBe("/pact/5/post/1");
    });

    it("should redirect to pact if pact name is clicked", async () => {
      document.body.innerHTML = ""; // clear render
      render(
        <MockComponent>
          <BasePostCard post={post} showPact={true}/>
        </MockComponent>
      );
      const pactName = await screen.findByTestId("pact");
      fireEvent.click(pactName);
      expect(window.location.pathname).toBe("/pact/5");
    });
  });
});
