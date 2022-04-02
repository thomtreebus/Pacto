/**
 * Tests for search results.
 */

import { cleanup, fireEvent, screen } from "@testing-library/react";
import SearchResults from "../pages/SearchResults";
import "@testing-library/jest-dom";
import { rest } from "msw";
import { Route } from 'react-router-dom'
import { useMockServer } from "./utils/useMockServer";
import mockRender from "./utils/mockRender";
import users from "./utils/testUsers";
import pacts from "./utils/testPacts";

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
				createdAt: new Date(Date.now()).toISOString(),
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
		users: users,
		pacts: pacts,
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

		it("should render PostList element", async () => {
			const postList = await screen.findByTestId("post-list");
			expect(postList).toBeInTheDocument();
		});

		it("should render UserList element", async () => {
			const userList = await screen.findByTestId("user-list");
			expect(userList).toBeInTheDocument();
		});

		it("should render PactGrid element", async () => {
			const pactGrid = await screen.findByTestId("pact-grid");
			expect(pactGrid).toBeInTheDocument();
		});

		it("allows the user to go to the pacts grid", async () => {
			const pactsButton = await screen.findByText("Pacts");
			fireEvent.click(pactsButton);
			const pactGrid = await screen.findByTestId("pact-grid");
			const userList = await screen.findByTestId("user-list");
			const postList = await screen.findByTestId("post-list");
			expect(pactGrid).toBeVisible();
			expect(userList).not.toBeVisible();
			expect(postList).not.toBeVisible();
		});


		it("allows the user to go to the user list", async () => {
			const usersButton = await screen.findByText("Users");
			fireEvent.click(usersButton);
			const pactGrid = await screen.findByTestId("pact-grid");
			const userList = await screen.findByTestId("user-list");
			const postList = await screen.findByTestId("post-list");
			expect(pactGrid).not.toBeVisible();
			expect(userList).toBeVisible();
			expect(postList).not.toBeVisible();
		});


		it("allows the user to go to the pacts grid", async () => {
			const postButton = await screen.findByText("Posts");
			fireEvent.click(postButton);
			const pactGrid = await screen.findByTestId("pact-grid");
			const userList = await screen.findByTestId("user-list");
			const postList = await screen.findByTestId("post-list");
			expect(pactGrid).not.toBeVisible();
			expect(userList).not.toBeVisible();
			expect(postList).toBeVisible();
		});

		it("shows the error page if there is an error while searching",async () => {
			server.use(
				rest.get(`${process.env.REACT_APP_URL}/search/e`, (req, res, ctx) => {
					return res(
						ctx.status(404),
						ctx.json(response)
					);
				})
			);
			cleanup();
			await mockRender(<MockSearchResults/>, `/search/e`);
			const errorMessage = await screen.findByText(/error/i)
			expect(errorMessage).toBeInTheDocument();
		})
	});
	
});
