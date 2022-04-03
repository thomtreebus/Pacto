/**
 * Tests for the user list component.
 */

import { screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import UserList from "../components/lists/UserList.jsx";
import users from "./utils/testUsers";
import { useMockServer } from "./utils/useMockServer.js";
import mockRender from "./utils/mockRender";

describe("User List Tests", () => {
	const server = useMockServer();

	describe("Check elements are rendered", () => {
		it("should render a message saying no users when the array is empty", async () => {
			await mockRender(<UserList users={[]} />);
			const message = screen.getByText(/There are no users in this category/i);
			expect(message).toBeInTheDocument();
		});

		it("should render all the users when passed in a list of users", async () => {
			await mockRender(<UserList users={users} />);
			users.forEach((user) => {
				const userName = screen.getByText(`${user.firstName} ${user.lastName}`);          
				expect(userName).toBeInTheDocument();				
			});
		});
	});
});
