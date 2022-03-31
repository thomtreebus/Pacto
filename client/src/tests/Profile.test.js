import { render, screen , waitFor } from "@testing-library/react";
import { waitForElementToBeRemoved } from "@testing-library/react";
import MockComponent from "./utils/MockComponent";
import "@testing-library/jest-dom";
import { rest } from "msw";
import {Route, Router} from "react-router-dom";
import Profile from "../pages/Profile";
import userEvent from "@testing-library/user-event";
import { createMemoryHistory } from 'history';
import pacts from "./utils/testPacts";
import { useMockServer } from "./utils/useMockServer";

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
    receivedRequests: [],
    sentRequests: [],
    _id: "UserID1",
    hobbies: [
      "Studying",
      "Video Games",
      "Football"
    ],
    instagram: "pactoInsta",
    linkedin: "pactlinked",
    phone: "pactphone",
}

describe("Profile Page Tests", () => {
  let history = undefined;
  const server = useMockServer();

  beforeEach(async () => {
    server.use(
      rest.get(`${process.env.REACT_APP_URL}/me`, (req, res, ctx) => {
        return res(
          ctx.json({
            message: user,
            errors: []
          })
        );
      }),
      rest.get(`${process.env.REACT_APP_URL}/users/:id`, (req, res, ctx) => {
        return res(
          ctx.json({
            message: user,
            errors: []
          })
        );
      }),
      rest.get(`${process.env.REACT_APP_URL}/university`, (req, res, ctx) => {
        return res(
          ctx.json({
            message: { pacts: pacts },
            errors: [],
          })
        );
      }),
      rest.post(`https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`, (req, res, ctx) => {
        return res(
          ctx.status(201),
          ctx.json({}),
        );
      }),
    );
  });

  const renderWithMock = async () => {
    history = createMemoryHistory({initialEntries:[`/user/${user._id}`]})

    render(
      <MockComponent>
        <Router history={history}>
          <Route exact path="/user/:id">
            <Profile />
          </Route>
          <Route exact path="/edit-profile">
            <h1>Redirected to edit-profile</h1>
          </Route>
          <Route exact path="/not-found">
            <h1>Redirected to not-found</h1>
          </Route>
        </Router>

      </MockComponent>
    );
    await waitForElementToBeRemoved(() => screen.getByText("Loading"));
  }

  describe("Tests with user who had socials", () => {

    beforeEach(async () => {
      await renderWithMock();
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

      it("should render the user's course and Uni when user has course", async () => {
        const subText = await screen.findByText(`${user.course} student at ${user.university.name}`);
        expect(subText).toBeInTheDocument();
      });

      it("should render the user's Uni if the user has no course", async () => {
        const user2 = user;
        user2.course = undefined;
        server.use(
          rest.get(`${process.env.REACT_APP_URL}/me`, (req, res, ctx) => {
            return res(
              ctx.json({
                message: user2,
                errors: []
              })
            );
          })
        );
        await renderWithMock();
        const subText = await screen.findByText(`Student at ${user.university.name}`);
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

      it("should render the friends text", async () => {
        const friendsInfo = await screen.findByText("2 Friends");
        expect(friendsInfo).toBeInTheDocument();
      });

      it("should render the pacts text", async () => {
        const pactsInfo = await screen.findByText("0 Pacts");
        expect(pactsInfo).toBeInTheDocument();
      });

      it("should render the editProfile button as not disabled if on their profile", async () => {
        const editProfileButton = await screen.findByText("Edit Profile");
        expect(editProfileButton).toBeInTheDocument();
        expect(editProfileButton.disabled).toBe(false)
      });

      it("should not render the friend buttons if on their own profile", async () => {
        const friendButtons = await screen.queryByTestId("friend-buttons");
        expect(friendButtons).not.toBeInTheDocument();
      });

    });

    describe("Check interaction with elements", () => {
      it("Edit profile button takes you to edit ", async () => {
        const editProfileButton = await screen.findByTestId("edit-profile-button")
        await waitFor(() => {
          userEvent.click(editProfileButton)
        });
        await waitFor(() => screen.findByText("Redirected to edit-profile"));
        expect(history.location.pathname).toBe("/edit-profile");
      });


      it("Friends chip button takes you to users page", async () => {
        const friendsButton = await screen.findByTestId("friends-button")
        await waitFor(() => {
          userEvent.click(friendsButton)
        });
        await waitFor(() => expect(history.location.pathname).toBe("/users"));
      });
    });
  });

  describe("Tests with user who doesn't have socials", () => {
    it("Undefined instagram, linkedin and phone ", async () => {
      let user2 = user;
      user2.instagram = undefined;
      user2.linkedin = undefined;
      user2.phone = undefined;

      server.use(
        rest.get(`${process.env.REACT_APP_URL}/me`, (req, res, ctx) => {
          return res(
            ctx.json({
              message: user2,
              errors: []
            })
          );
        }),
        rest.get(`${process.env.REACT_APP_URL}/users/:id`, (req, res, ctx) => {
          return res(
            ctx.json({
              message: user2,
              errors: []
            })
          );
        })
      );

      await renderWithMock();

      const instagramText = screen.queryByText("pactoInsta");
      expect(instagramText).not.toBeInTheDocument();
      const userNameText = screen.queryByText("pactlinked");
      expect(userNameText).not.toBeInTheDocument();
      const phoneText = screen.queryByText("pactphone");
      expect(phoneText).not.toBeInTheDocument();
    });
  });


  describe("Redirects to not-found if error received", () => {
    it("Redirects to not found if error received", async () => {
      server.use(
        rest.get(`${process.env.REACT_APP_URL}/users/:id`, (req, res, ctx) => {
          return res(
            ctx.status(401),
            ctx.json({
              message: user,
              errors: [1]
            })
          );
        })
      );

      await renderWithMock();
      await waitFor(() => screen.findByText("Redirected to not-found"));
      expect(history.location.pathname).toBe("/not-found");
    });
  });

  describe("Tests on other profiles", () => {
    let user2 = undefined;
    beforeEach( async () => {
      user2 = JSON.parse(JSON.stringify(user)); // copy without reference
      user2._id = "user2";
      server.use(
        rest.get(`${process.env.REACT_APP_URL}/me`, (req, res, ctx) => {
          return res(
            ctx.json({
              message: user2,
              errors: []
            })
          );
        }),
        rest.get(`${process.env.REACT_APP_URL}/users/:id`, (req, res, ctx) => {
          return res(
            ctx.json({
              message: user,
              errors: []
            })
          );
        }))
      await renderWithMock();
    });

    it("should not render the editProfile button if on other profile", async () => {
      const editProfileButton = screen.queryByText("Edit Profile");
      expect(editProfileButton).not.toBeInTheDocument();
    });

    it("should render the friend buttons if own another profile", async () => {
      const friendButtons = await screen.findByTestId("friend-buttons");
      expect(friendButtons).toBeInTheDocument();
    });
  })


});
