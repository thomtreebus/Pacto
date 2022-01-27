import { render, screen, fireEvent } from "@testing-library/react"
import Login from "../pages/LoginPage"
import { BrowserRouter } from "react-router-dom"
import "@testing-library/jest-dom"

const MockLogin = () => {
    return (
        <BrowserRouter>
            <Login />
        </BrowserRouter>
    )
}

describe("Check elements are rendered", () => {
    it("should render the background image element", () => {
        render(<MockLogin />)
        const gridElement = screen.getByTestId("background-login-image")
        expect(gridElement).toHaveStyle("background-image: url(https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80)")
    })

    it("should render the Pacto icon element", () => {
        render(<MockLogin />)
        const avatarElement = screen.getByAltText("Pacto Icon")
        expect(avatarElement).toBeInTheDocument()
    })

    it("should render the 'Sign In' header element", () => {
        render(<MockLogin />)
        const typographyElement = screen.getByRole("heading", { "name": "Sign In" })
        expect(typographyElement).toBeInTheDocument()
    })
    
    it("should render the email input element", () => {
        render(<MockLogin />)
        const inputElement = screen.getByRole("textbox", { "name": "Email Address" })
        expect(inputElement).toBeInTheDocument()
    })
    
    it("should render the password input element", () => {
        render(<MockLogin />)
        const inputElement = screen.getByTestId("password-input").querySelector("input")
        expect(inputElement).toBeInTheDocument()
    })
    
    it("should render the sign in button element", () => {
        render(<MockLogin />)
        const buttonElement = screen.getByRole("button", { "name": "Sign In" })
        expect(buttonElement).toBeInTheDocument()
    })
    
    it("should render the 'Don't have an account? Sign Up' link element", () => {
        render(<MockLogin />)
        const linkElement = screen.getByRole("link", { "name": "Don't have an account? Sign Up" })
        expect(linkElement).toBeInTheDocument()
    })
})

describe("Check interaction with elements", () => {
    it("should be able to type into email field", () => {
        render(<MockLogin />)
        const inputElement = screen.getByRole("textbox", { "name": "Email Address" })
        fireEvent.change(inputElement, { target: { value: "johndoe@kekw.org" } })
        expect(inputElement.value).toBe("johndoe@kekw.org")
    })
    
    it("should be able to type into password field", () => {
        render(<MockLogin />)
        const inputElement = screen.getByTestId("password-input").querySelector("input")
        fireEvent.change(inputElement, { target: { value: "hunter123" } })
        expect(inputElement.value).toBe("hunter123")
    })

    it("should redirect to sign up if the sign up button is pressed", () => {
        render(<MockLogin />)
        const linkElement = screen.getByRole("link", { name: "Don't have an account? Sign Up" })
        fireEvent.click(linkElement)
        expect(window.location.pathname).toBe("/signup")
    })
})
