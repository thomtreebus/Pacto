import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { waitForElementToBeRemoved } from "@testing-library/react";
import SearchResults from "../pages/SearchResults";
import "@testing-library/jest-dom";
import MockComponent from "./utils/MockComponent";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { createMemoryHistory } from 'history';
import { Router, Route } from 'react-router-dom'
import users from "./utils/testUsers";
import { useMockServer } from "./utils/useMockServer";

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
		const history = createMemoryHistory({ initialEntries: [`/search/e`] });

		render(
			<MockComponent>
				<Router history={history}>
					<Route exact path="/search/:query">
						<SearchResults />
					</Route>
				</Router>
			</MockComponent>
		);
		await waitForElementToBeRemoved(() => screen.getByText("Loading"));
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
