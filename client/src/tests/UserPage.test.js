import UserPage from "../pages/UserPage";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { waitForElementToBeRemoved } from "@testing-library/react";
import "@testing-library/jest-dom";
import MockComponent from "./utils/MockComponent";
import { rest } from "msw";
import { setupServer } from "msw/node";
import users from "./utils/testUsers";

describe("User Page Tests", () => {
	const server = setupServer(
		rest.get(`${process.env.REACT_APP_URL}/me`, (req, res, ctx) => {
			return res(
				ctx.json({
					message: users[1],
					errors: [],
				})
			);
		}),
        rest.get(`${process.env.REACT_APP_URL}/users`, (req, res, ctx) => {
			return res(
				ctx.json({				
					message: users,
					errors: [],
				})
			);
		})
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
 
	beforeEach(async () => {
		render(
			<MockComponent>
				<UserPage />
			</MockComponent>
		);
	    await waitForElementToBeRemoved(() => screen.getByText("Loading"));
	});

	describe("Check elements are rendered", () => {

        it("should render the all the category tags", async () => {
          expect(true).toBe(true);
        });

		it("should render the all the category tags", async () => {
			const categories = ["All university users", "Friends", "Same Course", "Same Location"];
			for(let i = 0; i < categories.length; i++) {
				const tab = await screen.findByText(categories[i]);
				expect(tab).toBeInTheDocument();
			}
		});
	});
});
