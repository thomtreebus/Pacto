import { render, screen, waitFor } from "@testing-library/react";
import PostCard from "../components/cards/PostCard";
import "@testing-library/jest-dom";
import MockComponent from "./utils/MockComponent";
import { setupServer } from "msw/node";
import { rest } from "msw";

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
  upvoters: [],
  downvoters: [],
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
  upvoters: [],
  downvoters: [],
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
  upvoters: [],
  downvoters: [],
  comments: [0,0,0,0],
  _id: 1
}

describe("PostCard Tests", () => {
  const server = setupServer(
		rest.get(`${process.env.REACT_APP_URL}/me`, (req, res, ctx) => {
			return res(
				ctx.json({ message: { firstName: "pac", lastName: "to", _id: "5" }, errors: [] })
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
  
  describe("Check correct post type is rendered", () => {
    it("should render a text post when type is text", async () => {
      render(
        <MockComponent>
          <PostCard post={textPost} />
        </MockComponent>
      );
      await screen.findByText("amet officia molestias esse!");
    });

    it("should render an image post when type is image", async () => {
      render(
        <MockComponent>
          <PostCard post={imagePost} />
        </MockComponent>
      );
      await waitFor(() => {
        expect(screen.getByRole("img").src).toBe("http://localhost/imagelink");
      })
    });

    it("should render a link post when type is link", async () => {
      render(
        <MockComponent>
          <PostCard post={linkPost} />
        </MockComponent>
      );
      await screen.findByRole("link");
    });
  })
});
