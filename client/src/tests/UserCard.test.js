import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { waitForElementToBeRemoved } from "@testing-library/react";
import "@testing-library/jest-dom";
import MockComponent from "./utils/MockComponent";
import { rest } from "msw";
import { setupServer } from "msw/node";
import UserCard from "../components/UserCard"
import testUsers from "./utils/testUsers"

describe("UserCard Tests", () => {
	const server = setupServer(
		rest.get(`${process.env.REACT_APP_URL}/me`, (req, res, ctx) => {
			return res(
				ctx.json({ message: { 
                    firstName: "pac", 
                    lastName: "to",
                    image: "https://avatars.dicebear.com/api/identicon/temp.svg",
                    friends: [1], // Logged in user is friends with testUsers[0]
                    sentRequests: [{_id: 1, recipient: 2}], // and has sent a request to testUser[1]
                    receivedRequests: [{_id: 2, requestor: 3}], // and has received a request from testUser[2]
                    // User has no relationship with testUseer[3]
                }, 
                errors: [] 
            })
			);
		}),

        rest.post(`${process.env.REACT_APP_URL}/friends/:4`, (req, res, ctx) => {
			return res(
				ctx.json({ 
                    message: {}, 
                    errors: [] 
                })
			);
		}), 

        rest.put(`${process.env.REACT_APP_URL}/friends/:2/accept`, (req, res, ctx) => {
			return res(
				ctx.json({ 
                    message: {}, 
                    errors: [] 
                })
			);
		}), 

        rest.put(`${process.env.REACT_APP_URL}/friends/:2/reject`, (req, res, ctx) => {
			return res(
				ctx.json({ 
                    message: {}, 
                    errors: [] 
                })
			);
		}), 

        rest.put(`${process.env.REACT_APP_URL}/friends/remove/:1`, (req, res, ctx) => {
			return res(
				ctx.json({ 
                    message: {}, 
                    errors: [] 
                })
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

	const renderWithMock = async (children) => {
		render(<MockComponent>{children}</MockComponent>);
		await waitForElementToBeRemoved(() => screen.getByText("Loading"));
	};

    describe("Check element rendering", () => {
        beforeEach(async () => {
            await renderWithMock(<UserCard user={testUsers[0]} />);
        });

        it("should render the user's profile picture", async () => {
            const cardImage = await screen.getByAltText(/image/i);
            expect(cardImage).toBeInTheDocument();
        });

        it("should render the user's first name", () => {
            const firstName = screen.getByText(/Pac/i);
            expect(firstName).toBeInTheDocument();
        });

        it("should render the user's last name", () => {
            const lastName = screen.getByText(/To/i);
            expect(lastName).toBeInTheDocument();
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
            await waitFor(() => expect(window.location.pathname).toBe("/user/1"));	
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
            await waitFor(() => expect(window.location.pathname).toBe("/user/1"));	
        });
    })
});