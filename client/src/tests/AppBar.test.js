import { render, screen, fireEvent, waitForElementToBeRemoved } from "@testing-library/react"
import AppBar from "../components/AppBar.jsx";
import "@testing-library/jest-dom";
import MockComponent from "./utils/MockComponent.jsx";
import { rest } from "msw";
import { setupServer } from "msw/node";

const MockAppBar = () => {
  return (
    <MockComponent>
      <AppBar />
    </MockComponent>
  );
};

describe("App Bar Tests", () => {

  beforeEach(async () => {
    render(<MockAppBar />);
    await waitForElementToBeRemoved(() => screen.getByText("Loading"));
  });

  const server = setupServer(
		rest.get(`${process.env.REACT_APP_URL}/me`, (req, res, ctx) => {
			return res(
				ctx.json({ message: { firstName: "pac", lastName: "to" }, errors: [] })
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
  
    it("should render the mobile menu button element", () => {
      const iconButtonElement = screen.getByTestId("mobile-menu-button");
      expect(iconButtonElement).toBeInTheDocument();
      const moreIconElement = screen.getByTestId("more-button");
      expect(moreIconElement).toBeInTheDocument();
    });
  
    it("should render the mobile button menu item elements", () => {
      const menuElement = screen.getByTestId("primary-search-account-menu-mobile");
      expect(menuElement).toBeInTheDocument();
      const profileItemElement = screen.getByTestId("profile-item-mobile");
      expect(profileItemElement).toBeInTheDocument();
      const logoutItemElement = screen.getByTestId("logout-item-mobile");
      expect(logoutItemElement).toBeInTheDocument();
    });
  });

  describe("Check interaction with elements", () => {
    it("should log out the user when log out is pressed", () => {
      const logoutItemElement = screen.getByTestId("logout-item");
      fireEvent.click(logoutItemElement);
      expect(window.location.pathname).toBe("/");
    });

    it("should redirect to home when the Pacto icon is pressed", () => {
      const buttonElement = screen.getByTestId("home-button");
      fireEvent.click(buttonElement);
      expect(window.location.pathname).toBe("/");
    });

    it("should open the profile menu when the icon button is pressed", () => {
      const iconButtonElement = screen.getByTestId("profile-button");
      fireEvent.click(iconButtonElement);
      const menuElement = screen.getByTestId("primary-search-account-menu");
      expect(menuElement).toBeInTheDocument();
    });

    // it("should close the profile menu when a menu item is pressed", () => { 
    //   const iconButtonElement = screen.getByTestId("profile-button");
    //   fireEvent.click(iconButtonElement);
    //   const menuElement = screen.getByTestId("primary-search-account-menu");
    //   expect(menuElement).toBeInTheDocument();
    //   const profileItemElement = screen.getByTestId("profile-item");
    //   fireEvent.click(profileItemElement);
    //   !expect(menuElement).toBeInTheDocument();
    // });
  });
});