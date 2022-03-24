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

    const renderWithMock = async () => {
        render(
            <MockComponent>
                <UserPage />
            </MockComponent>
        );
        await waitForElementToBeRemoved(() => screen.getByText("Loading"));
    };

    describe("Check elements are rendered", () => {

        beforeEach(async () => {
            await renderWithMock();
        });

        it("should render the all the category tags", async () => {
            const categories = ["All university users", "Friends", "Same Course", "Same Location"];
            for (let i = 0; i < categories.length; i++) {
                const tab = await screen.findByText(categories[i]);
                expect(tab).toBeInTheDocument();
            }
        });
    });

    describe("Check interaction with elements", () => {

        beforeEach(async () => {
            await renderWithMock();
        });

        const allUsers = users.map((user) => user._id);
        async function assertUsersShown(usersToBeShown) {
            for (let i = 0; i < users.length; i++) {
                if (usersToBeShown.includes(allUsers[i])) {
                    const user = await screen.findByText(allUsers[i]); U
                    expect(user).toBeInTheDocument();
                } else {
                    const user = screen.queryByText(allUsers[i]);
                    expect(user).not.toBeInTheDocument();
                }
            }
        }

        describe("Category tab interactions", () => {
            it("only shows the users of a given category when a category is selected", async () => {
                const categories = ["All university users", "Friends", "Same Course", "Same Location"];
                const tabs = categories.map((category) => screen.getByText(category));
                fireEvent.click(tabs[0]);
                await assertUsersShown(["1"]);
                fireEvent.click(tabs[1]);
                await assertUsersShown(["2"]);
                fireEvent.click(tabs[2]);
                await assertUsersShown(["3"]);
                fireEvent.click(tabs[3]);
                await assertUsersShown(["4"]);
            });
        })
    });
});