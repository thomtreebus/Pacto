/**
 * Tests for the friends button component.
 */

import { screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { rest } from "msw";
import FriendButtons from "../../components/FriendButtons";
import testUsers from "./helpers/testUsers";
import { useMockServer } from "./helpers/useMockServer";
import mockRender from "./helpers/mockRender";

const loggedInUser = {
	firstName: "pac",
	lastName: "to",
	image: "https://avatars.dicebear.com/api/identicon/temp.svg",
	friends: [1], // Logged-in user is friends with testUsers[0]
	sentRequests: [{ _id: 1, recipient: 2 }], // and has sent a request to testUser[1]
	receivedRequests: [{ _id: 2, requestor: 3 }], // and has received a request from testUser[2]
	// User has no relationship with testUser[3]
};

describe("FriendButton Tests", () => {
	const server = useMockServer();

	beforeEach(async () => {
		server.use(
			rest.get(`${process.env.REACT_APP_URL}/me`, (req, res, ctx) => {
				return res(
					ctx.json({
						message: loggedInUser,
						errors: [],
					})
				);
			}),
			rest.post(`${process.env.REACT_APP_URL}/friends/:4`, (req, res, ctx) => {
				return res(
					ctx.json({
						message: {},
						errors: [],
					})
				);
			}),
			rest.put(
				`${process.env.REACT_APP_URL}/friends/:2/accept`,
				(req, res, ctx) => {
					return res(
						ctx.json({
							message: {},
							errors: [],
						})
					);
				}
			),
			rest.put(
				`${process.env.REACT_APP_URL}/friends/:2/reject`,
				(req, res, ctx) => {
					return res(
						ctx.json({
							message: {},
							errors: [],
						})
					);
				}
			),
			rest.put(
				`${process.env.REACT_APP_URL}/friends/remove/:1`,
				(req, res, ctx) => {
					return res(
						ctx.json({
							message: {},
							errors: [],
						})
					);
				}
			)
		);
	});

	describe("Check element rendering and interaction: is-friend case", () => {
		beforeEach(async () => {
			await mockRender(
				<FriendButtons currentUser={loggedInUser} user={testUsers[0]} />
			);
		});

		it("should render delete friend button", async () => {
			const delFriendBtn = await screen.findByTestId("del-friend-btn");
			expect(delFriendBtn).toBeInTheDocument();
		});

		it("handles delete friend press", async () => {
			const delFriendBtn = await screen.findByTestId("del-friend-btn");
			fireEvent.click(delFriendBtn);
			
			const addFriendBtn = await screen.findByTestId("add-friend-btn");
			expect(addFriendBtn).toBeInTheDocument();
			expect(delFriendBtn).not.toBeInTheDocument();
		});
	});

	describe("Check element rendering and interaction: request-sent case", () => {
		beforeEach(async () => {
			await mockRender(
				<FriendButtons currentUser={loggedInUser} user={testUsers[1]} />
			);
		});

		it("should render request sent button", async () => {
			const reqSentBtn = await screen.findByTestId("sent-req-btn");
			expect(reqSentBtn).toBeInTheDocument();
			expect(reqSentBtn).toHaveAttribute("disabled");
		});
	});

	describe("Check element rendering and interaction: request-received case", () => {
		beforeEach(async () => {
			await mockRender(
				<FriendButtons currentUser={loggedInUser} user={testUsers[2]} />
			);
		});

		it("should render accept request button", async () => {
			const reqAcceptBtn = await screen.findByTestId("accept-req-btn");
			expect(reqAcceptBtn).toBeInTheDocument();
		});

		it("should render reject request button", async () => {
			const reqRejectBtn = await screen.findByTestId("reject-req-btn");
			expect(reqRejectBtn).toBeInTheDocument();
		});

		it("handles accept friend press", async () => {
			const accept = await screen.findByTestId("accept-req-btn");
			fireEvent.click(accept);
			const del = await screen.findByTestId("del-friend-btn");
			expect(del).toBeInTheDocument();
			expect(accept).not.toBeInTheDocument();
		});

		it("handles reject friend press", async () => {
			const reject = await screen.findByTestId("reject-req-btn");
			fireEvent.click(reject);
			const add = await screen.findByTestId("add-friend-btn");
			expect(add).toBeInTheDocument();
			expect(reject).not.toBeInTheDocument();
		});
	});

	describe("Check element rendering and interaction: no-relation case", () => {
		beforeEach(async () => {
			await mockRender(
				<FriendButtons currentUser={loggedInUser} user={testUsers[3]} />
			);
		});

		it("should render add friend button", async () => {
			const addFriendBtn = await screen.findByTestId("add-friend-btn");
			expect(addFriendBtn).toBeInTheDocument();
		});

		it("handles add friend press", async () => {
			const addFriendBtn = await screen.findByTestId("add-friend-btn");
			fireEvent.click(addFriendBtn);
			const reqSentBtn = await screen.findByTestId("sent-req-btn");
			expect(reqSentBtn).toBeInTheDocument();
			expect(reqSentBtn).toBeDisabled();
      expect(addFriendBtn).not.toBeInTheDocument();
		});
	});
});
