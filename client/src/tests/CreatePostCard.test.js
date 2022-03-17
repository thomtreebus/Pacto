import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { waitForElementToBeRemoved } from "@testing-library/react";
import CreatePostCard from "../components/CreatePostCard";
import PactPage from "../pages/PactPage";
import "@testing-library/jest-dom";
import MockComponent from "./utils/MockComponent";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { Router, Route } from "react-router-dom";
import { createMemoryHistory } from 'history';

const pactId = 1;
const response = {
  message: {
    name: "PactName",
    description: "PactDescription",
    members: [0,0,0],
    posts: [
      {
        pact: 5,
        author: {
          firstName: "Krishi",
          lastName: "Wali",
          _id: 1
        },
        date: "5/5/5",
        title: "Lorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem",
        text: "Lorem ipsum dolor inventore ad! Porro soluta eum amet officia molestias esse!Lorem ipsum dolor inventore ad! Porro soluta eum amet officia molestias esse!Lorem ipsum dolor inventore ad! Porro soluta eum amet officia molestias esse!",
        type: "text",
        votes: 6,
        upvoters: [],
        downvoters: [],
        comments: [0,0,0,0],
        _id: 1
      }
    ]
  }
}

describe("CreatePostCard Tests", () => {
	const server = setupServer(
		rest.get(`${process.env.REACT_APP_URL}/me`, (req, res, ctx) => {
			return res(
				ctx.json({ message: { firstName: "pac", lastName: "to" }, errors: [] })
			);
		}),
		rest.get(`${process.env.REACT_APP_URL}/pact/${pactId}`, (req, res, ctx) => {
			return res(
        		ctx.json(response)
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

	let history;

	beforeEach(async () => {
		history = createMemoryHistory({ initialEntries: [`/pact/1`] });

		render(
			<MockComponent>
				<Router history={history}>
					<Route exact path="/pact/:pactID">
						<PactPage />
					</Route>
					<Route exact path="/not-found">
						Not Found
					</Route>
				</Router>
				<CreatePostCard />
			</MockComponent>
		);
		await waitForElementToBeRemoved(() => screen.getByText("Loading"));
	});

	describe("Check elements are rendered", () => {
		it("should render the tabs selection box", async () => {
			const tabsElement = await screen.findByLabelText("tabs");
			expect(tabsElement).toBeInTheDocument();
		});

		it("should render the Post icon on the tab menu", async () => {
			const iconElement = await screen.findByLabelText("Post");
			expect(iconElement).toBeInTheDocument();
		});

		it("should render the Image icon on the tab menu", async () => {
			const iconElement = await screen.findByLabelText("Image");
			expect(iconElement).toBeInTheDocument();
		});

		it("should render the Link icon on the tab menu", async () => {
			const iconElement = await screen.findByLabelText("Link");
			expect(iconElement).toBeInTheDocument();
		});

		it("should render the title text field in the tabs", async () => {
			const inputElement = await screen.findByLabelText("Title");
			expect(inputElement).toBeInTheDocument();
		});

		it("should render the multiline text field in the text post tab", async () => {
			const inputElement = await screen.findByLabelText("Text");
			expect(inputElement).toBeInTheDocument();
		});

		it("should render the photo icon in the image post tab", async () => {
			const inputElement = await screen.findByTestId("PhotoIcon");
			expect(inputElement).toBeInTheDocument();
		});

		it("should render the link input text field in the link tab", async () => {
			const iconElement = await screen.findByTestId("link-icon");
			fireEvent.click(iconElement)
			const inputElement = await screen.findByTestId("link-input");
			expect(inputElement).toBeInTheDocument();
		});

		it("should render the submit button", async () => {
			const buttonElement = await screen.findByRole("button", {
				name: "Post",
			});
			expect(buttonElement).toBeInTheDocument();
		});
  });

	describe("Check interaction with elements", () => { 
		it("should be able to type into title field", async () => {
			const inputElement = await screen.findByLabelText("Title");
			fireEvent.change(inputElement, {target: { value: "This is a title"} });
			expect(inputElement.value).toBe("This is a title");
		});

		it("should be able to type into the multiline text field", async () => {
			const inputElement = await screen.findByLabelText("Text");
			fireEvent.change(inputElement, {target: { value: "This is a text field."} });
			expect(inputElement.value).toBe("This is a text field.");
		});

		it("should be able to type into the link text field", async () => {
			const link = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

			const iconElement = await screen.findByTestId("link-icon");
			fireEvent.click(iconElement)
			const inputElementDiv = await screen.findByTestId("link-input");
			const inputElement = inputElementDiv.querySelector("input");
			fireEvent.change(inputElement, {target: { value: link } });
			expect(inputElement.value).toBe(link);
		});

		it("should redirect to the created post when the Post button is pressed with valid input", async () => {
			console.log(server.use(
				rest.post(`${process.env.REACT_APP_URL}/pact/${pactId}/post`, (req, res, ctx) => {
					return res(
						ctx.status(201),
						ctx.json({
							message: {
								_id: 1,
								title: "This is a title",
								text: "This is a text field.",
								image: null,
								link: null,
								type: "text"
							},
							errors: [],
						})
					);
				})
			))
			const buttonElement = await screen.findByRole("button", {
				name: "Post",
			});
			fireEvent.click(buttonElement);
			await waitFor(() => expect(window.location.pathname).toBe("/pact/"+pactId+"/post/1"));
		});
	});
	
});
