import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { waitForElementToBeRemoved } from "@testing-library/react";
import CreatePostCard from "../components/CreatePostCard";
import "@testing-library/jest-dom";
import MockComponent from "./utils/MockComponent";
import { rest } from "msw";
import { setupServer } from "msw/node";

describe("CreatePostCard Tests", () => {
	const server = setupServer(
		rest.get(`${process.env.REACT_APP_URL}/me`, (req, res, ctx) => {
			return res(
				ctx.json({ message: { firstName: "pac", lastName: "to" }, errors: [] })
			);
		}),
		rest.post(`${process.env.REACT_APP_URL}/pact/1/post`, (req, res, ctx) => {
			return res(
				ctx.status(401),
				ctx.json({
					message: null,
					errors: [{ field: null, message: "The details entered are invalid." }],
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
			const inputElement = await screen.findByLabelText("Link");
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

			const iconElement = await screen.findByLabelText("Link");
			fireEvent.click(iconElement)
			const inputElement = await screen.findByTestId("link-input");
			console.log(inputElement)
			fireEvent.change(inputElement, {target: { value: link } });
			expect(inputElement.value).toBe(link);
		});

		// it("should redirect to the created post when the Post button is pressed with valid input", async () => {
		// 	server.use(
		// 		rest.post(`${process.env.REACT_APP_URL}/pact/1/post`, (req, res, ctx) => {
		// 			return res(
		// 				ctx.status(201),
		// 				ctx.json({
		// 					message: {
		// 						_id: 1,
		// 						title: "This is a title",
		// 						text: "This is a text field.",
		// 						type: "text"
		// 					},
		// 					errors: [],
		// 				})
		// 			);
		// 		})
		// 	);
		// 	const buttonElement = await screen.findByRole("button", {
		// 		name: "Post",
		// 	});
		// 	fireEvent.click(buttonElement);
		// 	await waitFor(() => expect(window.location.pathname).toBe("/pact/1/post/1"));
		// });
	});
	
});
