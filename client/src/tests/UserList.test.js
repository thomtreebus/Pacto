import { render, screen, waitForElementToBeRemoved } from "@testing-library/react";
import "@testing-library/jest-dom";
import UserList from "../components/UserList.jsx";
import { rest } from "msw";
import { setupServer } from "msw/node";
import users from "./utils/testUsers";
import MockComponent from "./utils/MockComponent.jsx";

describe("User List Tests", () => {
	const server = setupServer(
		rest.get(`${process.env.REACT_APP_URL}/me`, (req, res, ctx) => {
			return res(
				ctx.json({ message: {
                    _id : "1",
                    firstName: "pac",
                    lastName: "to"
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

	const renderWithMock = async (element) => {
		render(
			<MockComponent>
				{element}
			</MockComponent>
		);
    await waitForElementToBeRemoved(() => screen.getByText("Loading"));
	};

	describe("Check elements are rendered", () => {
		it("should render a message saying no users when the array is empty", async () => {
			await renderWithMock(<UserList users={[]} />);
			const message = screen.getByText(/There are no users in this category/i);
			expect(message).toBeInTheDocument();
		});

		it("should render all the users when passed in a list of users", async () => {
			await renderWithMock(<UserList users={users} />);
			users.forEach((user) => {
				const userName = screen.getByText(`${user.firstName} ${user.lastName}`);          
				expect(userName).toBeInTheDocument();				
			});
		});
	});
});