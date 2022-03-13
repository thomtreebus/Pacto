import { render, screen, fireEvent } from "@testing-library/react";
import PostCard from "../components/cards/PostCard";
import "@testing-library/jest-dom";

const textPost = {
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

const imagePost = {
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
  image: "imagelink",
  type: "image",
  votes: 6,
  upvoted: false,
  downvoted: false,
  comments: [0,0,0,0],
  _id: 1
}

const linkPost = {
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
  link: "link",
  type: "link",
  votes: 6,
  upvoted: false,
  downvoted: false,
  comments: [0,0,0,0],
  _id: 1
}

describe("PostCard Tests", () => {
  describe("Check correct post type is rendered", () => {
    it("should render a text post when type is text", () => {
      render(<PostCard post={textPost} />);
      screen.getByText("amet officia molestias esse!");
    });

    it("should render an image post when type is image", () => {
      render(<PostCard post={imagePost} />);
      expect(screen.getByRole("img").src).toBe("http://localhost/imagelink");
    });

    it("should render a link post when type is link", () => {
      render(<PostCard post={linkPost} />);
      screen.getByRole("link");
    });
  })
});
