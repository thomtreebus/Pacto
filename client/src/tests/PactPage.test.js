import { render, screen, fireEvent, waitForElementToBeRemoved } from "@testing-library/react";
import PactPage from "../pages/PactPage";
import "@testing-library/jest-dom";
import { rest } from "msw";
import { setupServer } from "msw/node";
import MockComponent from "./utils/MockComponent";
import { MemoryRouter, Route } from "react-router-dom";

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

  describe("Check elements are rendered", () => {
    beforeEach(async () => {
      render(
        <MockComponent>
          <MemoryRouter initialEntries={[`/pact/1`]}>
            <Route exact path="/pact/:pactID">
              <PactPage />
            </Route>
          </MemoryRouter>
        </MockComponent>
      )
      await waitForElementToBeRemoved(() => screen.getByText("Loading"));
    })

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

  describe("Check miscellaneous behaviour", () => {
    it("should show loading page indefinitely if fetch fails", async () => {
      server.use(
				rest.get(`${process.env.REACT_APP_URL}/pact/1`, (req, res, ctx) => {
					return res(
						ctx.status(400)
          );
				})
			);

      render(
        <MockComponent>
          <MemoryRouter initialEntries={[`/pact/1`]}>
            <Route exact path="/pact/:pactID">
              <PactPage />
            </Route>
          </MemoryRouter>
        </MockComponent>
      )
      screen.getByText("Loading")
    })
  })
})
