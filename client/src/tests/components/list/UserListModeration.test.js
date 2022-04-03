/**
 * Tests for the user list variant that uses the card with moderation tools instead of the 
 * default user cards.
 */

import { screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import users from "../../helpers/testUsers";
import UserListModeration from "../../../components/lists/UserListModeration";
import { useMockServer } from "../../helpers/useMockServer";
import mockRender from "../../helpers/mockRender";

describe("User List Tests", () => {
	const server = useMockServer();

	describe("Check elements are rendered", () => {
		it("should render a message saying no users when the array is empty", async () => {
			await mockRender(<UserListModeration users={[]} pact={null} showBannedUsers={true} />);
			const message = screen.getByText(/There are no users in this category/i);
			expect(message).toBeInTheDocument();
		});

		it("should render all the users when passed in a list of users", async () => {
			await mockRender(<UserListModeration users={users} pact={null} showBannedUsers={true} />);
			users.forEach((user) => {
				const userName = screen.getByText(`${user.firstName} ${user.lastName}`);          
				expect(userName).toBeInTheDocument();				
			});
		});
	});
});
