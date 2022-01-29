import { render, screen, fireEvent } from "@testing-library/react"
import AppBar from "../components/AppBar.jsx";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";

const MockAppBar = () => {
  return (
    <BrowserRouter>
      <AppBar />
    </BrowserRouter>
  )
}

describe("Check elements are rendered", () => {

  beforeEach(() => {
    render(<MockAppBar />)
  })

  it("should render the app bar element", () => {
    const appBarElement = screen.getByTestId("app-bar")
    expect(appBarElement).toBeInTheDocument()
  })

  it("should render the Pacto icon element", () => {
    const avatarElement = screen.getByAltText("Pacto Icon")
    expect(avatarElement).toBeInTheDocument()
    const buttonElement = screen.getByTestId("home-button")
    expect(buttonElement).toBeInTheDocument()
  })

  it("should render the search element", () => {
    const searchElement = screen.getByTestId("search-bar")
    expect(searchElement).toBeInTheDocument()
    const searchIconElement = screen.getByTestId("search-icon")
    expect(searchIconElement).toBeInTheDocument()
  })

  it("should render the profile button element", () => {
    const iconButtonElement = screen.getByTestId("profile-button")
    expect(iconButtonElement).toBeInTheDocument()
    const accountCircleElement = screen.getByTestId("account-circle")
    expect(accountCircleElement).toBeInTheDocument()
  })

  it("should render the profile button menu item elements", () => {
    const menuElement = screen.getByTestId("primary-search-account-menu")
    expect(menuElement).toBeInTheDocument()
    const profileItemElement = screen.getByTestId("profile-item")
    expect(profileItemElement).toBeInTheDocument()
    const logoutItemElement = screen.getByTestId("logout-item")
    expect(logoutItemElement).toBeInTheDocument()
  })

  it("should render the mobile menu button element", () => {
    const iconButtonElement = screen.getByTestId("mobile-menu-button")
    expect(iconButtonElement).toBeInTheDocument()
    const moreIconElement = screen.getByTestId("more-button")
    expect(moreIconElement).toBeInTheDocument()
  })

  it("should render the mobile button menu item elements", () => {
    const menuElement = screen.getByTestId("primary-search-account-menu-mobile")
    expect(menuElement).toBeInTheDocument()
    const profileItemElement = screen.getByTestId("profile-item-mobile")
    expect(profileItemElement).toBeInTheDocument()
    const logoutItemElement = screen.getByTestId("logout-item-mobile")
    expect(logoutItemElement).toBeInTheDocument()
  })

})