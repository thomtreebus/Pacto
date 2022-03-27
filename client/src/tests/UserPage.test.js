import UserPage from "../pages/UserPage";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { waitForElementToBeRemoved } from "@testing-library/react";
import "@testing-library/jest-dom";
import MockComponent from "./utils/MockComponent";
import { rest } from "msw";
import { setupServer } from "msw/node";
import users from "./utils/testUsers";
import { createMemoryHistory } from 'history';
import {Route, Router} from "react-router-dom";

const CATEGORIES = ["Same University", "Friends", "Same Course", "Same Location", "Received Requests", "Sent Requests"];

describe("User Page Tests", () => {
    let history = undefined;

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
        history = createMemoryHistory({initialEntries:[`/users`]})

        render(
            <MockComponent>
                <Router history={history}>
                    <Route exact path="/users">
                        <UserPage />
                    </Route>
                    <Route exact path="/user/:id">
                        <h1>Redirected to user-profile</h1>
                    </Route>
                    <Route exact path="/not-found">
                        <h1>Redirected to not-found</h1>
                    </Route>
                </Router>
            </MockComponent>
        );
        await waitForElementToBeRemoved(() => screen.getByText("Loading"));
    };

    describe("Check elements are rendered", () => {

        beforeEach(async () => {
            await renderWithMock();
        });

        it("should render the all the category tags", async () => {
            for (let i = 0; i < CATEGORIES.length; i++) {
                const tab = await screen.findByText(CATEGORIES[i]);
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
                    const user = await screen.findByText(allUsers[i]); 
                    expect(user).toBeInTheDocument();
                } else {
                    const user = screen.queryByText(allUsers[i]);
                    expect(user).not.toBeInTheDocument();
                }
            }
        }

        describe("Category tab interactions", () => {
            it("only shows the users of a given category when a category is selected", async () => {
                const tabs = CATEGORIES.map((category) => screen.getByText(category));
                fireEvent.click(tabs[0]);
                await assertUsersShown(["1"]);
                fireEvent.click(tabs[1]);
                await assertUsersShown(["2"]);
                fireEvent.click(tabs[2]);
                await assertUsersShown(["3"]);
                fireEvent.click(tabs[3]);
                await assertUsersShown(["4"]);
            });
        
            it("does not show users that share the same mutal value if the mutal value is blank", async () => {
                cleanup();
                const userCopy = Object.assign({}, users[0]);
                userCopy.location = ' ';
                userCopy.course = ' ';
                server.use(
                    rest.get(`${process.env.REACT_APP_URL}/me`, (req, res, ctx) => {
                        return res(
                            ctx.json({
                                message: userCopy,
                                errors: [],
                            })
                        );
                    })
                );
                await renderWithMock();
                const tabs = CATEGORIES.slice(2).map((category) => screen.getByText(category));
                fireEvent.click(tabs[0]);
                await assertUsersShown(["0"]);
                fireEvent.click(tabs[1]);
                await assertUsersShown(["0"]);
            });
        })
    });

    describe("Check miscellaneous behaviour", () => {

        beforeEach(async () => {
            await renderWithMock();
        });

        it("redirects to page not found if the user doesnt exist", async () => {
            server.use(
                rest.get(`${process.env.REACT_APP_URL}/users`, (req, res, ctx) => {
                    return res(
                        ctx.status(404)
                    );
                })
            );

            await renderWithMock();
            expect(history.location.pathname).toBe("/not-found");
        })
    })
});