import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { waitForElementToBeRemoved } from "@testing-library/react";
import "@testing-library/jest-dom";
import MockComponent from "./utils/MockComponent";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { Route } from "react-router-dom";
import Profile from "../pages/EditProfile";

describe("Profile Page Tests", () => {
  const server = setupServer(
    rest.get(`${process.env.REACT_APP_URL}/me`, (req, res, ctx) => {
      return res(
        ctx.json({ message: {
            firstName: "pac",
            lastName: "to",
            friends: [],
            university: { // subject to change
              name: "King's College London",
            },
          }, errors: [] })
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

  beforeEach(async () => {
    render(
      <MockComponent>
          <Profile />
          <Route exact path="/profile">
            <h1>Redirected to profile</h1>
          </Route>
      </MockComponent>
    );
    await waitForElementToBeRemoved(() => screen.getByText("Loading"));
  });

  describe("Check elements are rendered", () => {
    it("should render the instagram field", async () => {
      const instagramField = await screen.findByRole("textbox", {
        name: "Instagram"
      });
      expect(instagramField).toBeInTheDocument();
    });

    it("should render the Phone number field", async () => {
      const phoneNumberField = await screen.findByRole("textbox", {
        name: "Phone Number"
      });
      expect(phoneNumberField).toBeInTheDocument();
    });

    it("should render the LinkedIn field", async () => {
      const linkedInField = await screen.findByRole("textbox", {
        name: "LinkedIn"
      });
      expect(linkedInField).toBeInTheDocument();
    });

    it("should render the Course field", async () => {
      const courseField = await screen.findByRole("textbox", {
        name: "Course"
      });
      expect(courseField).toBeInTheDocument();
    });

    it("should render the Location field", async () => {
      const locationField = await screen.findByRole("textbox", {
        name: "Location"
      });
      expect(locationField).toBeInTheDocument();
    });

    it("should render the Bio field", async () => {
      const bioField = await screen.findByRole("textbox", {
        name: "Bio"
      });
      expect(bioField).toBeInTheDocument();
    });

    it("should render the \"upload image\" button", async () => {
      const uploadImageButton = await screen.findByRole("button", {
        name: "Upload Image"
      });
      expect(uploadImageButton).toBeInTheDocument();
    });

    /*
    it("should render the select image icon button", async () => {
      const selectImageButton = await screen.findByLabelText("Select Image")
      expect(selectImageButton).toBeInTheDocument();
    });
    */

    it("should render the update profile button", async () => {
      const updateProfileButton = await screen.findByRole("button", {
        name: "Update Profile"
      });
      expect(updateProfileButton).toBeInTheDocument();
    });

    it("should render the user's university", async () => {
      const universityText = await screen.findByText("King's College London");
      expect(universityText).toBeInTheDocument();
    });


    it("should render the user's profile picture", async () => {
      const profilePicture = await screen.findByAltText("Profile Picture");
      expect(profilePicture).toBeInTheDocument();
    });

    it("should render the user's name", async () => {
      const universityText = await screen.findByText("pac to");
      expect(universityText).toBeInTheDocument();
    });

  });

  describe("Check interaction with elements", () => {
    it("should be able to type into instagram field", async () => {
      const inputElement = await screen.findByRole("textbox", {
        name: "Instagram",
      });
      const testValue = "pacto"
      fireEvent.change(inputElement, { target: { value: testValue } });
      expect(inputElement.value).toBe(testValue);
    });

    it("should be able to type into Phone field", async () => {
      const inputElement = await screen.findByRole("textbox", {
        name: "Phone Number",
      });
      const testValue = "07777777777";
      fireEvent.change(inputElement, { target: { value: testValue } });
      expect(inputElement.value).toBe(testValue);
    });

    it("should be able to type into LinkedIn field", async () => {
      const inputElement = await screen.findByRole("textbox", {
        name: "LinkedIn",
      });
      const testValue = "Pacto";
      fireEvent.change(inputElement, { target: { value: testValue } });
      expect(inputElement.value).toBe(testValue);
    });

    it("should be able to type into Course field", async () => {
      const inputElement = await screen.findByRole("textbox", {
        name: "Course",
      });
      const testValue = "Art";
      fireEvent.change(inputElement, { target: { value: testValue } });
      expect(inputElement.value).toBe(testValue);
    });

    it("should be able to type into Location field", async () => {
      const inputElement = await screen.findByRole("textbox", {
        name: "Location",
      });
      const testValue = "Antartica";
      fireEvent.change(inputElement, { target: { value: testValue } });
      expect(inputElement.value).toBe(testValue);
    });

    it("should be able to type into Bio field", async () => {
      const inputElement = await screen.findByRole("textbox", {
        name: "Bio",
      });
      const testValue = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
      fireEvent.change(inputElement, { target: { value: testValue } });
      expect(inputElement.value).toBe(testValue);
    })


  });
});
