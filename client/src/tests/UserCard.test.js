import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { waitForElementToBeRemoved } from "@testing-library/react";
import "@testing-library/jest-dom";
import MockComponent from "./utils/MockComponent";
import { rest } from "msw";
import { setupServer } from "msw/node";
import UserCard from "../components/UserCard"
import testUsers from "./utils/testUsers"
import { useMockServer } from "./utils/useMockServer";

describe("UserCard Tests", () => {
    const {server} = useMockServer();

	const renderWithMock = async (children) => {
		render(<MockComponent>{children}</MockComponent>);
		await waitForElementToBeRemoved(() => screen.getByText("Loading"));
	};

    beforeEach(async () => {
        await renderWithMock(<UserCard user={testUsers[1]} />);
    });

    describe("Check element rendering", () => {
        it("should render the user's profile picture", async () => {
            const cardImage = await screen.getByAltText(/image/i);
            expect(cardImage).toBeInTheDocument();
        });

        it("should render the user's name", async () => {
            const firstName = await screen.findByTestId("user-name");
            expect(firstName).toBeInTheDocument();
        });

        it("should render friend buttons", async () => {
            const friendButtons = await screen.findByTestId("friend-buttons");
            expect(friendButtons).toBeInTheDocument();
        });
    });

    describe("Check element interaction", () => {
        it("should redirect to user profile when the user profile picture is pressed", async () => {
            server.use(
                rest.post(`${process.env.REACT_APP_URL}/user/:id`, (req, res, ctx) => {
                    return res(
                        ctx.status(201),
                        ctx.json({ 
                            message: 'Success', 
                            errors: [], 
                        })
                    );
                })
            );
            const buttonElement = await screen.findByTestId("user-image");
            fireEvent.click(buttonElement);
            await waitFor(() => expect(window.location.pathname).toBe("/user/2"));	
        });

        it("should redirect to user profile when the user name is pressed", async () => {
            server.use(
                rest.post(`${process.env.REACT_APP_URL}/user/:id`, (req, res, ctx) => {
                    return res(
                        ctx.status(201),
                        ctx.json({ 
                            message: 'Success', 
                            errors: [], 
                        })
                    );
                })
            );
            const buttonElement = await screen.findByTestId("user-name");
            fireEvent.click(buttonElement);
            await waitFor(() => expect(window.location.pathname).toBe("/user/2"));	
        });
    })
});