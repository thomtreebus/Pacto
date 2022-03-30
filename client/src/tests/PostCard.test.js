/**
 * Tests for the component that displays the post as a card.
 */

import { screen, waitFor } from "@testing-library/react";
import PostCard from "../components/cards/PostCard";
import "@testing-library/jest-dom";
import { useMockServer } from "./utils/useMockServer";
import mockRender from "./utils/mockRender";
import posts from "./utils/testPosts";

describe("PostCard Tests", () => {
  const server = useMockServer();
  
  describe("Check correct post type is rendered", () => {
    it("should render a text post when type is text", async () => {
      await mockRender(<PostCard post={posts[0]} />);
      await screen.findByText(posts[0].text);
    });

    it("should render a link post when type is link", async () => {
      await mockRender(<PostCard post={posts[1]} />);      
      await screen.findByRole("link");
    });

    it("should render an image post when type is image", async () => {
      await mockRender(<PostCard post={posts[2]} />);
      await waitFor(() => {
        expect(screen.getByRole("img").src).toBe(posts[2].image);
      })
    });
  })
});
