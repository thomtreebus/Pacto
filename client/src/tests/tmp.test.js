import {setupServer} from "msw/node";
import {rest} from "msw";
import {render, screen, waitForElementToBeRemoved} from "@testing-library/react";
import MockComponent from "./utils/MockComponent";
import {MemoryRouter, Route} from "react-router-dom";
import Profile from "../pages/Profile";


const user = {
  pacts: [],
  firstName: "pac",
  lastName: "to",
  friends: [
    "friendID1",
    "friendID2",
  ],
  bio: "hello world",
  uniEmail: "pac.to@kcl.ac.uk",
  course: 'Digital arts',
  location: 'London',
  image: "https://res.cloudinary.com/djlwzi9br/image/upload/v1644581875/man1_qexxnb.jpg",
  university: { // data structure subject to change
    _id: "uniID1",
    name: "King's College London",
    domains: [
      "@kcl.ac.uk"
    ],
  },
  _id: "UserID1",
  instagram: "pactoInsta",
  linkedin: "pactoLinkedIn",
  phone: "07999999999",
  hobbies: [
    "Studying",
    "Video Games",
    "Football"
  ],
}


it("Undefined instagram, linkedin and phone ", async () => {
  let user2 = user;
  user2.instagram = undefined;
  user2.linkedin = undefined;
  user2.phone = undefined;
  console.log(user2)
  const server2 = setupServer(
    rest.get(`${process.env.REACT_APP_URL}/me`, (req, res, ctx) => {
      return res(
        ctx.json({
          message: user2,
          errors: []
        })
      );
    }),
    rest.get(`${process.env.REACT_APP_URL}/users/${user._id}`, (req, res, ctx) => {
      return res(
        ctx.json({
          message: user2,
          errors: []
        })
      );
    })
  );
  server2.listen();
  server2.resetHandlers();
  render(
    <MockComponent>
      <MemoryRouter initialEntries={[`/user/${user._id}`]}>
        <Route exact path="/user/:id">
          <Profile />
        </Route>
        <Route exact path="/edit-profile">
          <h1>Redirected to edit-profile</h1>
        </Route>
        <Route exact path="/not-found">
          <h1>Redirected to not-found</h1>
        </Route>
      </MemoryRouter>

    </MockComponent>
  );
  await waitForElementToBeRemoved(() => screen.getByText("Loading"))
  const instagramText = await screen.findByText("pactoInsta");
  expect(instagramText).toBeNull();
  //const userNameText = await screen.findByText(user.linkedin);
  //expect(userNameText).toBeNull();
  //const phoneText = await screen.findByText(user.phone);
  //expect(phoneText).toBeNull();

});