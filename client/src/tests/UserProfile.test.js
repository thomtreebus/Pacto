import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { waitForElementToBeRemoved } from "@testing-library/react";
import MockComponent from "./utils/MockComponent";
import "@testing-library/jest-dom";
import { rest } from "msw";
import { setupServer } from "msw/node";
import {MemoryRouter, Route} from "react-router-dom";
import Profile from "../pages/Profile";
import userEvent from "@testing-library/user-event";
import {act} from "react-dom/test-utils";


const user = {
    pacts: [],
    firstName: "pac",
    lastName: "to",
    friends: [
      "friendID1",
      "friendID2",
    ],
    bio: "hello world",
    uniEmail: "pac.to@kcl.ac.uk",
    course: 'Digital arts',
    location: 'London',
    image: "https://res.cloudinary.com/djlwzi9br/image/upload/v1644581875/man1_qexxnb.jpg",
    university: { // data structure subject to change
      _id: "uniID1",
      name: "King's College London",
      domains: [
        "@kcl.ac.uk"
      ],
    },
    _id: "UserID1",
    instagram: "pactoInsta",
    linkedin: "pactoLinkedIn",
    phone: "07999999999",
    hobbies: [
      "Studying",
      "Video Games",
      "Football"
    ],
  }


describe("Profile Page Tests", () => {
  const server = setupServer(
    rest.get(`${process.env.REACT_APP_URL}/me`, (req, res, ctx) => {
      return res(
        ctx.json({
            message: user,
          errors: []
          })
      );
    }),

    rest.get(`${process.env.REACT_APP_URL}/users/${user._id}`, (req, res, ctx) => {
      return res(
        ctx.json({
          message: user,
          errors: []
        })
      );
    }),

    rest.post(`https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`, (req, res, ctx) => {
      return res(
        ctx.status(201),
        ctx.json({}),
      );
    }),
    /*
    rest.post(`${process.env.REACT_APP_URL}/users/add-friend`, (req, res, ctx) => {
      return res(
        ctx.status(201),
        ctx.json({}),
      );
    })
    */
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
        <MemoryRouter initialEntries={[`/user/${user._id}`]}>
          <Route exact path="/user/:id">
            <Profile />
            <Route exact path="/edit-profile">
              <h1>Redirected to edit-profile</h1>
            </Route>
          </Route>
        </MemoryRouter>
      </MockComponent>
    );
    await waitForElementToBeRemoved(() => screen.getByText("Loading"));
  });



  describe("Check elements are rendered", () => {

    it("should render the user's profile picture", async () => {
      const profilePicture = await screen.findByAltText("Profile Picture");
      expect(profilePicture).toBeInTheDocument();
      expect(profilePicture.getAttribute('src')).toBe(user.image);
    });

    it("should render the user's name", async () => {
      const name = await screen.findByText(user.firstName + " " + user.lastName);
      expect(name).toBeInTheDocument();
    });

    it("should render the user's course and Uni", async () => {
      const subText = await screen.findByText(`${user.course} student at ${user.university.name}`);
      expect(subText).toBeInTheDocument();
    });

    it("should render the user's location", async () => {
      const location = await screen.findByText(user.location);
      expect(location).toBeInTheDocument();
    });

    it("should render the instagram details", async () => {
      const instagramIcon = await screen.findByTestId("instagram-icon");
      expect(instagramIcon).toBeInTheDocument();
      const instagramText = await screen.findByText(user.instagram);
      expect(instagramText).toBeInTheDocument();
    });

    it("should render the linkedin details", async () => {
      const linkedInIcon = await screen.findByTestId("linkedin-icon");
      expect(linkedInIcon).toBeInTheDocument();
      const userNameText = await screen.findByText(user.linkedin);
      expect(userNameText).toBeInTheDocument();
    });

    it("should render the phone details", async () => {
      const phoneIcon = await screen.findByTestId("phone-icon");
      expect(phoneIcon).toBeInTheDocument();
      const phoneText = await screen.findByText(user.phone);
      expect(phoneText).toBeInTheDocument();
    });

    it("should render the bio", async () => {
      const phoneText = await screen.findByText(user.bio);
      expect(phoneText).toBeInTheDocument();
    });

    it("should render the posts button", async () => {
      const postsButton = await screen.findByLabelText("Posts");
      expect(postsButton).toBeInTheDocument();
    });

    it("should render the comments button", async () => {
      const commentsButton = await screen.findByLabelText("Comments");
      expect(commentsButton).toBeInTheDocument();
    });

    it("should render the pacts button", async () => {
      const pactsButton = await screen.findByLabelText("Pacts");
      expect(pactsButton).toBeInTheDocument();
    });

  });
});
