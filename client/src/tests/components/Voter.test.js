/**
 * Tests for the voter component / ie dislike and like functionality.
 */

import { screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Voter from "../../components/Voter";
import { useMockServer } from "./helpers/useMockServer";
import mockRender from "./helpers/mockRender";

const post = {
  pact: 5,
  author: {
    firstName: "Kieran",
    lastName: "Woolley",
    _id: 1
  },
  createdAt: "5/5/5",
  title: "ipsumLorem ipsumLorem ipsumLorem ipsumLorem",
  text: "amet officia molestias esse!",
  type: "text",
  votes: 6,
  upvoters: [],
  downvoters: [],
  comments: [0,0,0,0],
  _id: 1
}

describe("Voter Tests", () => {
  const server = useMockServer();
  
  beforeEach(async () => {
		await mockRender(
        <Voter initThumbUp={post.upvoters.includes(1)} initThumbDown={post.downvoters.includes(1)} initLikes={post.votes} handleLikeEvent={()=>{}}/>
    );
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
  });
});
