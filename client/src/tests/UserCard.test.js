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
                    friends: ["1"], // Logged in user is friends with testUsers[0]
                    sentRequests: [{recipient: "2"}], // and has sent a request to testUser[1]
                    receivedRequests: [{requestor: "3"}], // and has received a request from testUser[2]
                    // User has no relationship with testUseer[3]
                }, 
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

    describe("Check element rendering: general case", () => {
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

    describe("Check element rendering and interaction: is-friend case", () => {
        beforeEach(async () => {
            await renderWithMock(<UserCard user={testUsers[0]} />);
        });

        it("should render delete friend button", async () => {
            const delFriendBtn = await screen.findByTestId("del-friend-btn");
            expect(delFriendBtn).toBeInTheDocument();
        });
    });

    describe("Check element rendering and interaction: request-sent case", () => {
        beforeEach(async () => {
            await renderWithMock(<UserCard user={testUsers[1]} />);
        });

        it("should render request sent button", async () => {
            const reqSentBtn = await screen.findByTestId("sent-req-btn");
            expect(reqSentBtn).toBeInTheDocument();
            expect(reqSentBtn).toHaveAttribute("disabled");
        });
    });

    describe("Check element rendering and interaction: request-received case", () => {
        beforeEach(async () => {
            await renderWithMock(<UserCard user={testUsers[2]} />);
        });

        it("should render accept request button", async () => {
            const reqAcceptBtn = await screen.findByTestId("accept-req-btn");
            expect(reqAcceptBtn).toBeInTheDocument();
        });

        it("should render reject request button", async () => {
            const reqRejectBtn = await screen.findByTestId("reject-req-btn");
            expect(reqRejectBtn).toBeInTheDocument();
        });
    });

    describe("Check element rendering and interaction: no-relation case", () => {
        beforeEach(async () => {
            await renderWithMock(<UserCard user={testUsers[3]} />);
        });

        it("should render add friend button", async () => {
            const addFriendBtn = await screen.findByTestId("add-friend-btn");
            expect(addFriendBtn).toBeInTheDocument();
        });
    });

    describe("Check interaction with elements: general case", () => {

        it("should redirect to user profile when the user card is pressed", async () => {
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
            const buttonElement = await screen.findByTestId("userCard");
            fireEvent.click(buttonElement);
            await waitFor(() => expect(window.location.pathname).toBe("/user/1"));	
        });
    });  
});