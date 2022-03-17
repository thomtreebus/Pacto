import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { waitForElementToBeRemoved } from "@testing-library/react";
import EditPact from "../pages/EditPact";
import "@testing-library/jest-dom";
import MockComponent from "./utils/MockComponent";
import { rest } from "msw";
import { setupServer } from "msw/node";
import {Route, Router} from "react-router-dom";
import {act} from "react-dom/test-utils";
import userEvent from "@testing-library/user-event";
import { createMemoryHistory } from 'history';


const testUser = {
  firstName: "pac",
  lastName: "to",
}


const testPact = {
  _id : "1",
  name: "pactname",
  category: "pactcategory",
  description: "pactdescription",
}

describe("EditPact Tests", () => {
  let history = undefined;

  const server = setupServer(
    rest.get(`${process.env.REACT_APP_URL}/me`, (req, res, ctx) => {
      return res(
        ctx.json({ message: testUser, errors: [] })
      );
    }),
    rest.get(`${process.env.REACT_APP_URL}/pact/1`, (req, res, ctx) => {
      return res(
        ctx.json({ message: testPact, errors: [] })
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

  beforeEach(async () => {
    history = createMemoryHistory({initialEntries:[`/pact/${testPact._id}/edit-pact`]})
    render(
      <MockComponent>
        <Router history={history}>
          <Route exact path="/pact/:pactId/edit-pact">
            <EditPact />
          </Route>
          <Route exact path="/pact/:pactId">
            <h1>Redirected to pact</h1>
          </Route>
          <Route exact path="/not-found">
            <h1>Redirected to not-found</h1>
          </Route>
        </Router>
      </MockComponent>
    );
    await waitForElementToBeRemoved(() => screen.getByText("Loading"));
  });

  describe("Check elements are rendered", () => {
    it("should render the Pacto icon element", async () => {
      const avatarElement = await screen.findByAltText("Pacto Icon");
      expect(avatarElement).toBeInTheDocument();
    });

    it("should render the 'Edit Pact' header element", async () => {
      const typographyElement = await screen.findByRole("heading", {
        name: "Edit Pact",
      });
      expect(typographyElement).toBeInTheDocument();
    });

    it("should render the category select element", async () => {
      const selectElement = await screen.findByTestId("category-select");
      expect(selectElement).toBeInTheDocument();
    });

    it("should render the Pact Name input element", async () => {
      const inputElement = await screen.findByRole("textbox", {
        name: "Pact Name",
      });
      expect(inputElement).toBeInTheDocument();
    });

    it("should render the Description input element", async () => {
      const inputElement = await screen.findByRole("textbox", {
        name: "Description",
      });
      expect(inputElement).toBeInTheDocument();
    });

    it("should render the Edit Pact button", async () => {
      const buttonElement = await screen.findByRole("button", {
        name: "Edit Pact",
      });
      expect(buttonElement).toBeInTheDocument();
    });
  });

  describe("Check interaction with elements", () => {

    it("should be able to type into name field", async () => {
      const inputElementDiv = await screen.findByTestId("pact-name");
      const inputElement = inputElementDiv.querySelector("input");
      fireEvent.change(inputElement, { target: { value: "Church of Jeroen" } });
      expect(inputElement.value).toBe("Church of Jeroen");
    });

    it("should be able to type into description field", async () => {
      const inputElement = await screen.findByRole("textbox", {
        name: "Description",
      });
      fireEvent.change(inputElement, { target: { value: "This is the Church of Jeroen" } });
      expect(inputElement.value).toBe("This is the Church of Jeroen");
    });

    it("should redirect to feed page when the edit pact button is pressed with valid credentials", async () => {
      server.use(
        rest.put(`${process.env.REACT_APP_URL}/pact/1`, (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              message: {
                _id: 1,
                name: "Not the Church of Jeroen",
                category: "society",
                description: "This is not the Church of Jeroen."
              },
              errors: [],
            })
          );
        })
      );
      const buttonElement = await screen.findByRole("button", {
        name: "Edit Pact",
      });
      await act( async () => {
        fireEvent.click(buttonElement)
        await waitFor( () => expect(history.location.pathname).toBe("/pact/1"))
        await waitFor(() => screen.findByText("Redirected to pact"));
      });

    });

    it("should return error when invalid Pact name is entered and Edit Pact button is pressed with invalid input", async () => {
      server.use(
        rest.put(`${process.env.REACT_APP_URL}/pact/1`, (req, res, ctx) => {
          return res(
            ctx.status(401),
            ctx.json({
              message: null,
              errors: [{
                field: "name", message: "Provide the name"
              }],
            })
          );
        })
      );
      const nonExistingElement = screen.queryByText("Provide the name");
      expect(nonExistingElement).not.toBeInTheDocument();
      const buttonElement = await screen.findByRole("button", {
        name: "Edit Pact",
      });
      fireEvent.click(buttonElement);
      const firstNameElement = await screen.findByText("Provide the name");
      expect(firstNameElement).toBeInTheDocument();
    });

    it("should return error when invalid category is entered and Edit Pact button is pressed with invalid input", async () => {
      server.use(
        rest.put(`${process.env.REACT_APP_URL}/pact/1`, (req, res, ctx) => {
          return res(
            ctx.status(401),
            ctx.json({
              message: null,
              errors: [{
                field: "category", message: "Provide the category"
              }],
            })
          );
        })
      );
      const nonExistingElement = screen.queryByText("Provide the category");
      expect(nonExistingElement).not.toBeInTheDocument();
      const buttonElement = await screen.findByRole("button", {
        name: "Edit Pact",
      });
      fireEvent.click(buttonElement);
      const firstNameElement = await screen.findByText("Provide the category");
      expect(firstNameElement).toBeInTheDocument();
    });

    it("should return error when invalid description is entered and Edit Pact button is pressed with invalid input", async () => {
      server.use(
        rest.put(`${process.env.REACT_APP_URL}/pact/1`, (req, res, ctx) => {
          return res(
            ctx.status(401),
            ctx.json({
              message: null,
              errors: [{
                field: "description", message: "Provide the description"
              }],
            })
          );
        })
      );
      const nonExistingElement = screen.queryByText("Provide the description");
      expect(nonExistingElement).not.toBeInTheDocument();
      const buttonElement = await screen.findByRole("button", {
        name: "Edit Pact",
      });
      fireEvent.click(buttonElement);
      const firstNameElement = await screen.findByText("Provide the description");
      expect(firstNameElement).toBeInTheDocument();
    });

    it("should return multiple errors when multiple fields are entered when the Edit pact button is pressed with invalid credentials", async () => {
        server.use(
            rest.put(`${process.env.REACT_APP_URL}/pact/1`, (req, res, ctx) => {					
                return res(
                    ctx.status(400),
                    ctx.json({ 
                        message: null, 
                        errors : [
                            {field: "name", message: "Provide the  name"}, 
                            {field: "description", message: "Provide the description"}
                        ], 
                    }) 
                );					
            })
        );
        const nonExistingNameElement = screen.queryByText("Provide the name");
        const nonExistingDescriptionElement = screen.queryByText("Provide the description");
        expect(nonExistingNameElement).not.toBeInTheDocument();
        expect(nonExistingDescriptionElement).not.toBeInTheDocument();
        const buttonElement = await screen.findByRole("button", {
            name: "Edit Pact",
        });
        await act(async () => {
          fireEvent.click(buttonElement);
          const nameElement = await screen.findByText("Provide the name");
          const descriptionElement = await screen.findByText("Provide the description");
          expect(nameElement).toBeInTheDocument();
          expect(descriptionElement).toBeInTheDocument();
        });

    });

    it("should call handleCategorySelect() when clicking on a different category", async () => {
      const inputElementDiv = await screen.findByTestId("category-select");
      const inputElement = inputElementDiv.querySelector("input");
      fireEvent.change(inputElement, { target: { value: "society" } });
      expect(inputElement.value).toBe("society");
    });

    it("uploaded image contents should be saved as a state", async () => {
      server.use(
        rest.post(`https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`, (req, res, ctx) => {
          return res(
            ctx.status(201),
            ctx.json({
              url: "imageUrl",
              secure_url: "imageUrl",
            }),
          );
        })
      );
      const image = new File(['testImage'], 'testImage.png', {type: 'image/png'})
      const buttonElement = await screen.findByTestId(
        "image-upload-input"
      );
      await act(async () => {
        await waitFor(() => userEvent.upload(buttonElement, image));
        await waitFor(() => {
          expect(buttonElement.files[0]).toBe(image);
          expect(buttonElement.files[0]).toBe(image);
          expect(buttonElement.files).toHaveLength(1);
        });
      });
    });
  });
});
