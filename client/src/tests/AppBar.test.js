/**
 * Tests for the app bar which is used in the sidebar and is responsible
 * for functionality that spans multiple pages.
 */

import { screen, fireEvent, waitFor, act } from "@testing-library/react"
import AppBar from "../components/AppBar.jsx";
import "@testing-library/jest-dom";
import { rest } from "msw";
import { Switch } from "react-router-dom";
import PrivateRoute from "../components/PrivateRoute";
import AuthRoute from "../components/AuthRoute";
import { useMockServer } from "./utils/useMockServer.js";
import mockRender from "./utils/mockRender"
import userEvent from "@testing-library/user-event";

/**
 * A mock component to make it easier to test functionality.
 * 
 * @returns The mock component so that it can be rendered.
 */
const MockAppBarComponent = () => {
  return (
    <>
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
    </>
  )  
}

describe("App Bar Tests", () => {
  let history;
  const server = useMockServer();

	beforeEach(async () => {
		server.use(
      rest.get(`${process.env.REACT_APP_URL}/me`, (req, res, ctx) => {
        return res(
          ctx.json({ 
            message: {
              _id : "userid1",
              firstName: "pac",
              lastName: "to"
            },
            errors: []
          })
        );
      }),
      rest.get(`${process.env.REACT_APP_URL}/logout`, (req, res, ctx) => {
        return res(
          ctx.json({ message: null, errors: [] })
        );
      }),
      rest.get(`${process.env.REACT_APP_URL}/notifications`, (req, res, ctx) => {
        return res(
          ctx.json({
            errors: [], 
            message: [
              { __v: 0, _id: "1", text: "Your post received a new comment", read: true, time: "2022-03-25T10:02:42.545Z" },
              { __v: 0, _id: "2", text: "Your post received a new comment", read: false, time: "2022-03-25T10:02:42.545Z" }
            ] })
        );
      }),
      rest.put(`${process.env.REACT_APP_URL}/notifications/2/update`, (req, res, ctx) => {
        return res(
          ctx.json({
            errors: [], 
            message: [
              { __v: 0, _id: "1", text: "Your post received a new comment", read: true, time: "2022-03-25T10:02:42.545Z" },
              { __v: 0, _id: "2", text: "Your post received a new comment", read: true, time: "2022-03-25T10:02:42.545Z" }
            ] })
        );
      })
    );
	});

  const renderWithMock = async () => history = await mockRender (<MockAppBarComponent/>, '/feed')

  describe("Check elements are rendered", () => {

    beforeEach( async () => {
      await renderWithMock();
    })

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

    it("should render the notification card", async () => {
      const menuElement = await screen.findByTestId("notification-card-2");
      expect(menuElement).toBeInTheDocument();
    });

    it("should render the mark as read button on the notification card", async () => {
      const buttonElement = await screen.findByTestId("mark-notification-as-read-2");
      expect(buttonElement).toBeInTheDocument();
    });
  });

  describe("Check interaction with elements", () => {

    beforeEach( async () => {
      await renderWithMock();
    })

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
      expect(history.location.pathname).toBe("/login");
    });

    it("should redirect to home when the Pacto icon is pressed",async () => {
      const buttonElement = screen.getByTestId("home-button");
      fireEvent.click(buttonElement);
      const redirectMessage = await screen.findByText(/Redirected to feed/i);
			expect(redirectMessage).toBeInTheDocument();
      expect(history.location.pathname).toBe("/feed");
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
      expect(history.location.pathname).toBe("/edit-profile");
    });

    it("should redirect to profile view when profile button is pressed", async () => {
      const buttonElement = screen.getByTestId("profile-item");
      fireEvent.click(buttonElement);
      const redirectMessage = await screen.findByText(/Redirected to profile/i);
      expect(redirectMessage).toBeInTheDocument();
      expect(history.location.pathname).toBe("/user/userid1");
    });


    it("doesn't allow the user to search if the input is empty", async () => {
      const searchValue = "{enter}";
      const searchElementConatiner = await screen.findByTestId("appbar-search");
      const searchElement = searchElementConatiner.querySelector("input");
      userEvent.type(searchElement, searchValue);
      expect(history.location.pathname).toBe("/feed")
    })

    it("allows the user to search using the search bar if there is a value", async () => {
      const searchValue = "e{enter}";
      const searchElementConatiner = await screen.findByTestId("appbar-search");
      const searchElement = searchElementConatiner.querySelector("input");
      userEvent.type(searchElement, searchValue);
      expect(history.location.pathname).toBe("/search/e")
    })

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

    it("should remove the notification if the mark as read button is pressed", async () => {
      const buttonElement = await screen.findByTestId("mark-notification-as-read-2");
      await act(async () => {
        await waitFor(() => fireEvent.click(buttonElement));
        await expect(buttonElement).toBeDisabled();
        await waitFor(async () =>{
          expect(await screen.queryByTestId("notification-card-2")).not.toBeInTheDocument()
        });
      });
    });
  });

  describe("Other tests", () => {
    it("should display the error with marking a notification as read", async () => {
      server.use(
        rest.put(`${process.env.REACT_APP_URL}/notifications/2/update`, (req, res, ctx) => {
          return res(
            ctx.status(400),
            ctx.json({
              errors: [{field: null, message: "There was an error marking as read"}],
              message: null })
          );
        })
      );
      await renderWithMock();
      const buttonElement = await screen.findByTestId("mark-notification-as-read-2");
      await act(async () => {
        fireEvent.click(buttonElement);
        });
      expect(await screen.findByTestId("notification-card-2")).toBeInTheDocument();
      expect(await screen.findByText("There was an error marking as read")).toBeInTheDocument();
      expect(await screen.findByTestId("error-message-2")).toBeInTheDocument();
      expect(buttonElement).not.toBeDisabled();
    });
  })
});