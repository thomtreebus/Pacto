import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { waitForElementToBeRemoved } from "@testing-library/react";
import MockComponent from "./utils/MockComponent";
import "@testing-library/jest-dom";
import { rest } from "msw";
import { setupServer } from "msw/node";
import {MemoryRouter, Route} from "react-router-dom";
import Profile from "../pages/Profile";
import userEvent from "@testing-library/user-event";
import {queryClient} from './utils/MockComponent'

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
    hobbies: [
      "Studying",
      "Video Games",
      "Football"
    ],
    instagram: "pactoInsta",
    linkedin: "pactlinked",
    phone: "pactphone",
  }

  const queryCache = queryClient.getQueryCache()

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

    rest.get(`${process.env.REACT_APP_URL}/users/:id`, (req, res, ctx) => {
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

  afterEach( () => {
    queryCache.clear();
  })

  const renderWithMock = async () => {
    render(
      <MockComponent>
        <MemoryRouter initialEntries={[`/user/${user._id}`]}>
          <Route exact path="/user/:id">
            <Profile />
          </Route>
          <Route exact path="/edit-profile">
            <h1>Redirected to edit-profile</h1>
          </Route>
          <Route exact path="/not-found">
            <h1>Redirected to not-found</h1>
          </Route>
        </MemoryRouter>

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

      it("should render the editProfile button", async () => {
        const editProfileButton = await screen.findByText("Edit Profile");
        expect(editProfileButton).toBeInTheDocument();
        expect(editProfileButton.disabled).toBe(false)
      });

      it("should render the friends text", async () => {
        const friendsInfo = await screen.findByText("2 Friends");
        expect(friendsInfo).toBeInTheDocument();
      });

      it("should render the pacts text", async () => {
        const pactsInfo = await screen.findByText("0 Pacts");
        expect(pactsInfo).toBeInTheDocument();
      });

      it("should render the send friend request button", async () => {
        const sendFriendRequestButton = await screen.findByText("Send Friend Request");
        expect(sendFriendRequestButton).toBeInTheDocument();
        expect(sendFriendRequestButton.disabled).toBe(true)
      });

    });

    describe("Check interaction with elements", () => {
      it("Edit profile button takes you to edit ", async () => {
        const editProfileButton = await screen.findByTestId("edit-profile-button")
        await waitFor(() => {
          userEvent.click(editProfileButton)
        });
        await waitFor(() => screen.findByText("Redirected to edit-profile"));
      });

      it("Clicking on Comments tab tab highlights it", async () => {
        const commentsButton = await screen.getByRole('tab', { name: 'Comments' });
        await waitFor(() => {
          userEvent.click(commentsButton);
        });
        expect(screen.getByRole('tab', { selected: true })).toHaveTextContent('Comments');
      });

      it("Clicking on Pacts tab tab highlights it", async () => {
        const pactsButton = await screen.getByRole('tab', { name: 'Pacts' });
        await waitFor(() => {
          userEvent.click(pactsButton);
        });
        expect(screen.getByRole('tab', { selected: true })).toHaveTextContent('Pacts');
      });

      it("Clicking on Posts tab highlights it", async () => {
        const postsButton = await screen.getByRole('tab', { name: 'Posts' });
        await waitFor(() => {
          userEvent.click(postsButton);
        });
        expect(screen.getByRole('tab', { selected: true })).toHaveTextContent('Posts');
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


  describe("Redirects to not found if error received", () => {
    it("Redirects to not found if error received", async () => {
      server.use(
        rest.get(`${process.env.REACT_APP_URL}/me`, (req, res, ctx) => {
          return res(
            ctx.json({
              message: user,
              errors: [1]
            })
          );
        }),
        rest.get(`${process.env.REACT_APP_URL}/users/:id`, (req, res, ctx) => {
          return res(
            ctx.json({
              message: user,
              errors: [1]
            })
          );
        })
      );

      await renderWithMock();
      await waitFor(() => screen.findByText("Redirected to not-found"));

    });
  });


});
