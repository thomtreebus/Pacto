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

    beforeEach(async () => {
        await renderWithMock(<UserCard user={testUsers[0]} />);
    });

    describe("Check elements are rendered", () => {


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

    describe("Check interaction with elements", () => {

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