import { render, screen, fireEvent } from "@testing-library/react"
import Signup from "../pages/SignupPage.jsx";
import { BrowserRouter } from "react-router-dom"
import "@testing-library/jest-dom"

const MockSignup = () => {
    return (
        <BrowserRouter>
            <Signup />
        </BrowserRouter>
    )
}

describe("Check elements are rendered", () => {
	it("should render the Pacto icon element", () => {
		render(<MockSignup />)
		const avatarElement = screen.getByAltText("Pacto Icon")
		expect(avatarElement).toBeInTheDocument()
	})

	it("should render the 'Join Pacto!' header element", () => {
		render(<MockSignup />)
		const typographyElement = screen.getByRole("heading", { "name": "Join Pacto!" })
		expect(typographyElement).toBeInTheDocument()
	})

	it("should render the first name input element", () => {
		render(<MockSignup />)
		const inputElement = screen.getByRole("textbox", { "name": "First Name" })
		expect(inputElement).toBeInTheDocument()
	})

	it("should render the last name input element", () => {
		render(<MockSignup />)
		const inputElement = screen.getByRole("textbox", { "name": "Last Name" })
		expect(inputElement).toBeInTheDocument()
	})

	it("should render the email input element", () => {
		render(<MockSignup />)
		const inputElement = screen.getByRole("textbox", { "name": "University Email Address" })
		expect(inputElement).toBeInTheDocument()
	})

	it("should render the password input element", () => {
		render(<MockSignup />)
		const inputElement = screen.getByTestId("initial-password-input").querySelector("input")
		expect(inputElement).toBeInTheDocument()
	})

	it("should render the confirm password input element", () => {
		render(<MockSignup />)
		const inputElement = screen.getByTestId("confirm-password-input").querySelector("input")
		expect(inputElement).toBeInTheDocument()
	})

	it("should render the sign up button element", () => {
		render(<MockSignup />)
		const buttonElement = screen.getByRole("button", { "name": "Sign Up" })
		expect(buttonElement).toBeInTheDocument()
	})

	it("should render the 'Already have an account? Sign in' link element", () => {
		render(<MockSignup />)
		const linkElement = screen.getByRole("link", { "name": "Already have an account? Sign in" })
		expect(linkElement).toBeInTheDocument()
	})
})


describe("Check interaction with elements", () => {
	it("should be able to type into first name field", () => {
		render(<MockSignup />)
		const inputElement = screen.getByRole("textbox", { "name": "First Name" })
		fireEvent.change(inputElement, { target: { value: "John" } })
		expect(inputElement.value).toBe("John")
	})

	it("should be able to type into last name field", () => {
		render(<MockSignup />)
		const inputElement = screen.getByRole("textbox", { "name": "Last Name" })
		fireEvent.change(inputElement, { target: { value: "Doe" } })
		expect(inputElement.value).toBe("Doe")
	})

	it("should be able to type into email field", () => {
		render(<MockSignup />)
		const inputElement = screen.getByRole("textbox", { "name": "University Email Address" })
		fireEvent.change(inputElement, { target: { value: "johndoe@uni.ac.uk" } })
		expect(inputElement.value).toBe("johndoe@uni.ac.uk")
	})

	it("should be able to type into password field", () => {
		render(<MockSignup />)
		const inputElement = screen.getByTestId("initial-password-input").querySelector("input")
		fireEvent.change(inputElement, { target: { value: "Password123" } })
		expect(inputElement.value).toBe("Password123")
	})

	it("should be able to type into confirm password field", () => {
		render(<MockSignup />)
		const inputElement = screen.getByTestId("confirm-password-input").querySelector("input")
		fireEvent.change(inputElement, { target: { value: "Password123" } })
		expect(inputElement.value).toBe("Password123")
	})

	it("should redirect to sign in if the sign in button is pressed", () => {
		render(<MockSignup />)
		const linkElement = screen.getByRole("link", { name: "Already have an account? Sign in" })
		fireEvent.click(linkElement)
		expect(window.location.pathname).toBe("/login")
	})

	// Future test once homepage is setup
	//
	// it("should redirect to homepage if the sign up button is pressed", () => {
	// 	render(<MockSignup />)
	// 	const buttonElement = screen.getByRole("button", { name: "Sign up" })
	// 	fireEvent.click(buttonElement)
	// 	expect(window.location.pathname).toBe("/home")
	// })
})