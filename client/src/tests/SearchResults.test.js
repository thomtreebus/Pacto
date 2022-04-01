/**
 * Tests for search results.
 */

import { screen } from "@testing-library/react";
import SearchResults from "../pages/SearchResults";
import "@testing-library/jest-dom";
import { rest } from "msw";
import { Route } from 'react-router-dom'
import { useMockServer } from "./utils/useMockServer";
import mockRender from "./utils/mockRender";

const response = {
  message: {
    posts: [
      {
        pact: 5,
        author: {
          firstName: "Krishi",
          lastName: "Wali",
          _id: 1
        },
        createdAt: new Date(Date.now() - (86400000) * 0).toISOString(),
        title: "Lorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem",
        text: "Lorem ipsum dolor inventore ad! Porro soluta eum amet officia molestias esse!Lorem ipsum dolor inventore ad! Porro soluta eum amet officia molestias esse!Lorem ipsum dolor inventore ad! Porro soluta eum amet officia molestias esse!",
        type: "text",
        votes: 6,
        upvoters: [],
        downvoters: [],
        comments: [0,0,0,0],
        _id: 1
      }
		],
		users: [],
		pacts: [],
  }
}

const MockSearchResults = () => {
	return (
		<Route exact path="/search/:query">
			<SearchResults />
		</Route>
	);
}

describe("SearchResults Tests", () => {
	const server = useMockServer();

	beforeEach(async () => {
		server.use(
			rest.get(`${process.env.REACT_APP_URL}/search/e`, (req, res, ctx) => {
				return res(
					ctx.json(response)
				);
			})
		);
		jest.spyOn(console, 'error').mockImplementation(() => { });
	});


	beforeEach(async () => {
		await mockRender(<MockSearchResults/>, `/search/e`);
	});

	describe("Check elements are rendered", () => {
		it("should render Typography element", async () => {
			const tabsElement = await screen.findByTestId("tabs-element");
			expect(tabsElement).toBeInTheDocument();
		});

		it("should render PactGrid element", async () => {
			const pactGrid = await screen.findByTestId("pact-grid");
			expect(pactGrid).toBeInTheDocument();
		});

		it("should render PostList element", async () => {
			const postList = await screen.findByTestId("post-list");
			expect(postList).toBeInTheDocument();
		});

		it("should render UserList element", async () => {
			const userList = await screen.findByTestId("user-list");
			expect(userList).toBeInTheDocument();
		});

	});
	
});
