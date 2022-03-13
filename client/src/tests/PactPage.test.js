import { render, screen, waitForElementToBeRemoved } from "@testing-library/react";
import PactPage from "../pages/PactPage";
import "@testing-library/jest-dom";
import { rest } from "msw";
import { setupServer } from "msw/node";
import MockComponent from "./utils/MockComponent";
import { Router, Route } from "react-router-dom";
import { createMemoryHistory } from 'history';

const response = {
  message: {
    name: "PactName",
    description: "PactDescription",
    members: [0,0,0],
    posts: [
      {
        pact: {
          _id: 5
        },
        author: {
          firstName: "Krishi",
          lastName: "Wali",
          _id: 1
        },
        date: "5/5/5",
        title: "Lorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem",
        text: "Lorem ipsum dolor inventore ad! Porro soluta eum amet officia molestias esse!Lorem ipsum dolor inventore ad! Porro soluta eum amet officia molestias esse!Lorem ipsum dolor inventore ad! Porro soluta eum amet officia molestias esse!",
        type: "text",
        votes: 6,
        upvoters: [],
        downvoters: [],
        comments: [0,0,0,0],
        _id: 1
      }
    ]
  }
}

describe("PactPage Tests", () => {
  const server = setupServer(
		rest.get(`${process.env.REACT_APP_URL}/me`, (req, res, ctx) => {
			return res(
				ctx.json({ message: { firstName: "pac", lastName: "to", _id: "5" }, errors: [] })
			);
		}),
		rest.get(`${process.env.REACT_APP_URL}/pact/1`, (req, res, ctx) => {
			return res(
        ctx.json(response)
      );
		})
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

  let history;

  const renderWithMock = async () => {
    history = createMemoryHistory({ initialEntries: [`/pact/1`] });

    render(
      <MockComponent>
        <Router history={history}>
          <Route exact path="/pact/:pactID">
            <PactPage />
          </Route>
          <Route exact path="/not-found">
            Not Found
          </Route>
        </Router>
      </MockComponent>
    );

    await waitForElementToBeRemoved(() => screen.getByText("Loading"));
  }

  describe("Check elements are rendered", () => {
    describe("Normal behaviour", () => {

      beforeEach(async () => {
        await renderWithMock();
      });

      it("Check AboutPact card is rendered", async () => {
        await screen.findByTestId("about-pact");
      });
  
      it("Check PostList is rendered", async () => {
        await screen.findByTestId("search-box");
      });
  
      it("Check Add Post is rendered", async () => {
        await screen.findByTestId("AddIcon");
      });
    })
  })

  describe("Check miscellaneous behaviour", () => {
    it("redirects to page not found if the pact doesnt exist", async () => {
      server.use(
				rest.get(`${process.env.REACT_APP_URL}/pact/1`, (req, res, ctx) => {
					return res(
						ctx.status(404)
          );
				})
			);

      await renderWithMock();
      await screen.findAllByText(/Not found/i);
      expect(history.location.pathname).toBe("/not-found");
    })
  })
})
