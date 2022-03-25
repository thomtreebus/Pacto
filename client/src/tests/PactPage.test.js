import { fireEvent, render, screen, waitFor, waitForElementToBeRemoved } from "@testing-library/react";
import PactPage from "../pages/PactPage";
import "@testing-library/jest-dom";
import { rest } from "msw";
import { setupServer } from "msw/node";
import MockComponent from "./utils/MockComponent";
import { Router, Route } from "react-router-dom";
import { createMemoryHistory } from 'history';
import userEvent from "@testing-library/user-event";

const response = {
  message: {
    name: "PactName",
    description: "PactDescription",
    members: [0,0,0],
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
    moderators : [
      {
        _id: "5"
      }
    ],
  }
}

describe("PactPage Tests", () => {
  const server = setupServer(
		rest.get(`${process.env.REACT_APP_URL}/me`, (req, res, ctx) => {
			return res(
				ctx.json({ message: { firstName: "pac", lastName: "to", _id: response.message.moderators[0]._id, pacts: [] }, errors: [] })
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
          <Route exact path="/pact/:pactID/edit-pact">
            Redirected to edit-pact
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
    describe("When the user is a moderator", () => {
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

      it("Should render the edit button", () => {
        screen.getByTestId("edit-pact-button");
      });
    })

    describe("When the user is not a moderator", () => {
      it("Should not render the edit button", async () => {
        server.use(
          rest.get(`${process.env.REACT_APP_URL}/me`, (req, res, ctx) => {
            return res(ctx.json({ message: { firstName: "pac", lastName: "to", _id: response.message.moderators[0]._id + 1 }, errors: [] }));
          })
        );
        await renderWithMock();
        const editPactButton = screen.queryByTestId("edit-pact-button");
        expect(editPactButton).not.toBeInTheDocument()
      });
    })
  })

  describe("Check interaction with elements", () => {

    beforeEach(async () => {
      await renderWithMock();
    });

    it("should open the create post dialog when the add button is pressed, and close when escape is pressed", async () => {
      const addIconElement = await screen.findByTestId("AddIcon");
      fireEvent.click(addIconElement);
      const dialogElement = await screen.findByTestId("dialog")
      expect(dialogElement).toBeInTheDocument()
      fireEvent.keyDown(dialogElement, {
        key: "Escape",
        code: "Escape",
        keyCode: 27,
        charCode: 27
      });
      await waitFor(() => expect(dialogElement).not.toBeInTheDocument())
    }); 
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

    it("redirects to edit-pact if edit-pact icon is selected", async () => {
      await renderWithMock();
      const button = await screen.findByTestId("edit-pact-button")
      userEvent.click(button);
      await screen.findAllByText("Redirected to edit-pact");
      expect(history.location.pathname).toBe("/pact/1/edit-pact");
    })

  })
})
