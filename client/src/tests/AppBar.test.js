import { render, screen, fireEvent, waitFor, waitForElementToBeRemoved } from "@testing-library/react"
import AppBar from "../components/AppBar.jsx";
import "@testing-library/jest-dom";
import MockComponent from "./utils/MockComponent.jsx";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { Route,Switch} from "react-router-dom";
import { createMemoryHistory } from 'history';
import PrivateRoute from "../components/PrivateRoute";
import AuthRoute from "../components/AuthRoute";

describe("App Bar Tests", () => {

  const server = setupServer(
		rest.get(`${process.env.REACT_APP_URL}/me`, (req, res, ctx) => {
			return res(
				ctx.json({ message: {
          _id : "userid1",
          firstName: "pac",
          lastName: "to"
          }, errors: [] })
			);
		}),
    rest.get(`${process.env.REACT_APP_URL}/logout`, (req, res, ctx) => {
			return res(
				ctx.json({ message: null, errors: [] })
			);
		}),
    rest.get(`${process.env.REACT_APP_URL}/notifications`, (req, res, ctx) => {
      return res(
        ctx.json({ message: [], errors: [] })
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
    history = createMemoryHistory({ initialEntries: [`/feed`] });
    render(
      <MockComponent>
        <AuthRoute exact path="/login">
          <h1>Redirected to login</h1>
        </AuthRoute>

        <PrivateRoute path="*">
          <AppBar />
          <Switch>
            <PrivateRoute exact path="/feed">
              <h1>Redirected to feed</h1>
            </PrivateRoute>
            <PrivateRoute exact path="/edit-profile">
              <h1>Redirected to edit-profile</h1>
            </PrivateRoute>
            <PrivateRoute exact path="/user/userid1">
              <h1>Redirected to profile</h1>
            </PrivateRoute>
          </Switch>
        </PrivateRoute>
      </MockComponent>
      );
    await waitForElementToBeRemoved(() => screen.getByText("Loading"));
  });

  describe("Check elements are rendered", () => {
    it("should render the app bar element", () => {
      const appBarElement = screen.getByTestId("app-bar");
      expect(appBarElement).toBeInTheDocument();
    });
  
    it("should render the Pacto icon element", () => {
      const avatarElement = screen.getByAltText("Pacto Icon");
      expect(avatarElement).toBeInTheDocument();
      const buttonElement = screen.getByTestId("home-button");
      expect(buttonElement).toBeInTheDocument();
    });
  
    it("should render the search element", () => {
      const searchElement = screen.getByTestId("search-bar");
      expect(searchElement).toBeInTheDocument();
      const searchIconElement = screen.getByTestId("search-icon");
      expect(searchIconElement).toBeInTheDocument();
    });
  
    it("should render the profile button element", () => {
      const iconButtonElement = screen.getByTestId("profile-button");
      expect(iconButtonElement).toBeInTheDocument();
      const accountCircleElement = screen.getByTestId("account-circle");
      expect(accountCircleElement).toBeInTheDocument();
    });
  
    it("should render the profile button menu item elements", () => {
      const menuElement = screen.getByTestId("primary-search-account-menu");
      expect(menuElement).toBeInTheDocument();
      const profileItemElement = screen.getByTestId("profile-item");
      expect(profileItemElement).toBeInTheDocument();
      const logoutItemElement = screen.getByTestId("logout-item");
      expect(logoutItemElement).toBeInTheDocument();
    });
    
    it("should render the notifications icon bell", async () => {
      const menuElement = await waitFor(() => screen.getByTestId("NotificationsIcon"));
      expect(menuElement).toBeInTheDocument();
    });
  });

  describe("Check interaction with elements", () => {
    it("should log out the user when log out is pressed", async () => {
      server.use(
				rest.get(`${process.env.REACT_APP_URL}/me`, (req, res, ctx) => {
          return res(
            ctx.status(401)
          );
        })
			);
      const logoutItemElement = await screen.findByTestId("logout-item");
      fireEvent.click(logoutItemElement);
      const redirectMessage = await screen.findByText(/Redirected to login/i);
			expect(redirectMessage).toBeInTheDocument();
      expect(window.location.pathname).toBe("/login");
    });

    it("should redirect to home when the Pacto icon is pressed",async () => {
      const buttonElement = screen.getByTestId("home-button");
      fireEvent.click(buttonElement);
      const redirectMessage = await screen.findByText(/Redirected to feed/i);
			expect(redirectMessage).toBeInTheDocument();
      expect(window.location.pathname).toBe("/feed");
    });

    it("should open the profile menu when the icon button is pressed", async () => {
      const iconButtonElement = screen.getByTestId("profile-button");
      fireEvent.click(iconButtonElement);
      const menuElement = screen.getByTestId("primary-search-account-menu");
      await waitFor(() => expect(menuElement).toBeVisible());
    });

    it("should close the profile menu when a menu item is pressed", async () => {
      const iconButtonElement = screen.getByTestId("profile-button");
      fireEvent.click(iconButtonElement);
      const menuElement = screen.getByTestId("primary-search-account-menu");
      await waitFor(() => expect(menuElement).toBeVisible());
    });
  
    it("should close the profile menu when a menu item is pressed", async () => { 
      const iconButtonElement = screen.getByTestId("profile-button");
      fireEvent.click(iconButtonElement);
      const menuElement = screen.getByTestId("primary-search-account-menu");
      expect(menuElement).toBeInTheDocument();
      const profileItemElement = screen.getByTestId("profile-item");
      fireEvent.click(profileItemElement);
      await waitFor(() => expect(menuElement).not.toBeVisible());
    });

    it("should redirect to edit-profile view when edit profile button is pressed", async () => {
      const buttonElement = screen.getByTestId("edit-profile-item");
      fireEvent.click(buttonElement);
      const redirectMessage = await screen.findByText(/Redirected to edit-profile/i);
      expect(redirectMessage).toBeInTheDocument();
      expect(window.location.pathname).toBe("/edit-profile");
    });

    it("should redirect to profile view when profile button is pressed", async () => {
      const buttonElement = screen.getByTestId("profile-item");
      fireEvent.click(buttonElement);
      const redirectMessage = await screen.findByText(/Redirected to profile/i);
      expect(redirectMessage).toBeInTheDocument();
      expect(window.location.pathname).toBe("/user/userid1");
    });

    it("should open the notifications menu when the notification bell is pressed", async () => {
      const buttonElement = await waitFor(() => screen.getByTestId("notification-button"));
      fireEvent.click(buttonElement);
      const menuElement = screen.getByTestId("notifications-menu");
      await waitFor(() => expect(menuElement).toBeVisible());
    });

    it("should close the profile menu when the user presses escape", async () => { 
      const iconButtonElement = await waitFor(() => screen.getByTestId("notification-button"));
      fireEvent.click(iconButtonElement);
      const menuElement = screen.getByTestId("notifications-menu");
      expect(menuElement).toBeInTheDocument();
      fireEvent.keyDown(menuElement, {
        key: 'Escape',
        code: 'Escape'
      });
      await waitFor(() => expect(menuElement).not.toBeVisible());
    });

    it("should filter notifications to only display ones that are unread", async () => {
      server.use(
				rest.get(`${process.env.REACT_APP_URL}/notifications`, (req, res, ctx) => {
          return res(
            ctx.json({
              errors: [], 
              message: [
                { __v: 0, _id: "1", text: "Your post received a new comment", read: true, time: "2022-03-25T10:02:42.545Z" },
                { __v: 0, _id: "2", text: "Your post received a new comment", read: false, time: "2022-03-25T10:02:42.545Z" }
              ] })
          );
        })
      );
      const iconButtonElement = screen.getByTestId("notification-button");
      fireEvent.click(iconButtonElement);
      const menuElement = screen.getByTestId("notification-card");
    });
  });
});