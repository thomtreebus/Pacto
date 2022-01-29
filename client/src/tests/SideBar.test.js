import { render, screen, fireEvent } from "@testing-library/react";
import SideBar from "../components/SideBar";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";

// const MockSideBar = () => {
//     return (
//         <BrowserRouter>
//             <Login />
//         </BrowserRouter>
//     )
// }

describe("Check elements are rendered", () => {

  beforeEach(() => {
    render(<SideBar />)
  })
  it("should render the drawer element", () => {
    const drawerElement = screen.getByTestId("sidebar-drawer")
    expect(drawerElement).toBeInTheDocument()
  })

  it("should render the toolbar element", () => {
    const toolbarElement = screen.getByTestId("sidebar-toolbar")
    expect(toolbarElement).toBeInTheDocument()
  })
    
  it("should render the drawer element", () => {
    const drawerElement = screen.getByTestId("sidebar-drawer")
    expect(drawerElement).toBeInTheDocument()
  })

  it("should render the user profile list element", () => {
    const profileElement = screen.getByTestId("sidebar-profile-list")
    expect(profileElement).toBeInTheDocument()
  })

  it("should render the user's avatar", () => {
    const avatarElement = screen.getByTestId("sidebar-avatar")
    expect(avatarElement).toBeInTheDocument()
  })

  it("should render the user's name", () => {
    const userNameElement = screen.getByTestId("sidebar-user-name")
    expect(userNameElement).toBeInTheDocument()
  })

  it("should render the university hub item", () => {
    const hubIconElement = screen.getByTestId("sidebar-hub-icon")
    expect(hubIconElement).toBeInTheDocument()
    const hubTextElement = screen.getByTestId("sidebar-hub")
    expect(hubTextElement).toBeInTheDocument()
  })

  it("should render the feed item", () => {
    const feedIconElement = screen.getByTestId("sidebar-feed-icon")
    expect(feedIconElement).toBeInTheDocument()
    const feedTextElement = screen.getByTestId("sidebar-feed")
    expect(feedTextElement).toBeInTheDocument()
  })

  it("should render the pacts item", () => {
    const pactIconElement = screen.getByTestId("sidebar-pacts-icon")
    expect(pactIconElement).toBeInTheDocument()
    const pactTextElement = screen.getByTestId("sidebar-pacts")
    expect(pactTextElement).toBeInTheDocument()
  })

  it("should render the friends item", () => {
    const friendIconElement = screen.getByTestId("sidebar-friends-icon")
    expect(friendIconElement).toBeInTheDocument()
    const friendTextElement = screen.getByTestId("sidebar-friends")
    expect(friendTextElement).toBeInTheDocument()
  })

  it("should render the friends item", () => {
    const friendIconElement = screen.getByTestId("sidebar-friends-icon")
    expect(friendIconElement).toBeInTheDocument()
    const friendTextElement = screen.getByTestId("sidebar-friends")
    expect(friendTextElement).toBeInTheDocument()
  })

  it("should render the 'Sign In' header element", () => {
    const typographyElement = screen.getByTestId("sidebar-mypacts-text")
    expect(typographyElement).toBeInTheDocument()
  })
  
})