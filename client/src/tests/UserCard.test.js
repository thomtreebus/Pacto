/**
 * Test for the user card component.
 */

import { screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { rest } from "msw";
import UserCard from "../components/UserCard"
import testUsers from "./utils/testUsers"
import { useMockServer } from "./utils/useMockServer";
import mockRender from "./utils/mockRender";

describe("UserCard Tests", () => {
    let history;
    const server = useMockServer();

    beforeEach(async () => {
        history = await mockRender(<UserCard user={testUsers[1]} />);
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
            await waitFor(() => expect(history.location.pathname).toBe("/user/2"));	
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
            await waitFor(() => expect(history.location.pathname).toBe("/user/2"));	
        });
    })
});