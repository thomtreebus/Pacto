import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { waitForElementToBeRemoved } from "@testing-library/react";
import CreatePostCard from "../components/CreatePostCard";
import "@testing-library/jest-dom";
import MockComponent from "./utils/MockComponent";
import { rest } from "msw";
import { setupServer } from "msw/node";
import userEvent from "@testing-library/user-event";
import {act} from "react-dom/test-utils";

const pactId = 1;

function serverPostRequest(server, type){
	server.use(
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
						type: type
					},
					errors: [],
				})
			);
		}),
	);
}

describe("CreatePostCard Tests", () => {
	const server = setupServer(
		rest.get(`${process.env.REACT_APP_URL}/me`, (req, res, ctx) => {
			return res(
				ctx.json({ message: { firstName: "pac", lastName: "to", _id: "5" }, errors: [] })
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
				<CreatePostCard pactID={pactId} />
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
			serverPostRequest(server, "text")
			const buttonElement = await screen.findByRole("button", {
				name: "Post",
			});
			fireEvent.click(buttonElement);
			await waitFor(() => expect(window.location.pathname).toBe(`/pact/${pactId}/post/1`));
		});

		it("should determine the post as an image post if the image tab was pressed", async () => {
			const iconElement = await screen.findByTestId("link-icon");
			fireEvent.click(iconElement)
			serverPostRequest(server, "link")
			const buttonElement = await screen.findByRole("button", {
				name: "Post",
			});
			fireEvent.click(buttonElement);
		});

		it("should determine the post as a link post if the link tab was pressed", async () => {
			const iconElement = await screen.findByTestId("image-icon");
			fireEvent.click(iconElement)
			serverPostRequest(server, "image")
			const buttonElement = await screen.findByRole("button", {
				name: "Post",
			});
			fireEvent.click(buttonElement);
		});

		it("should display an error if there is an error with the title.", async () => {
			server.use(
				rest.post(`${process.env.REACT_APP_URL}/pact/${pactId}/post`, (req, res, ctx) => {
					return res(
						ctx.status(401),
						ctx.json({
							message: null,
							errors: [{
								field: "title", message: "Provide the title"
							}],
						})
					);
				})
			);
			const nonExistingElement = screen.queryByText("Provide the title");
			expect(nonExistingElement).not.toBeInTheDocument();
			const buttonElement = await screen.findByRole("button", {
				name: "Post",
			});
			fireEvent.click(buttonElement);
			const existingElement = await screen.findByText("Provide the title");
			expect(existingElement).toBeInTheDocument();
		});

		it("should display an error if there is an error with the link.", async () => {
			const iconElement = await screen.findByTestId("link-icon");
			fireEvent.click(iconElement);
			server.use(
				rest.post(`${process.env.REACT_APP_URL}/pact/${pactId}/post`, (req, res, ctx) => {
					return res(
						ctx.status(401),
						ctx.json({
							message: null,
							errors: [{
								field: "link", message: "Provide a valid link"
							}],
						})
					);
				})
			);
			const nonExistingElement = screen.queryByText("Provide a valid link");
			expect(nonExistingElement).not.toBeInTheDocument();
			const buttonElement = await screen.findByRole("button", {
				name: "Post",
			});
			fireEvent.click(buttonElement);
			const existingElement = await screen.findByText("Provide a valid link");
			expect(existingElement).toBeInTheDocument();
		});

		it("uploaded image contents should be saved as a state", async () => {
			server.use(
				rest.post(`https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`, (req, res, ctx) => {
					return res(
						ctx.status(201),
						ctx.json({}),
					);
				})
			);
			const iconElement = await screen.findByTestId("image-icon");
			const image = new File(['testImage'], 'testImage.png', {type: 'image/png'})
			
			await act(async () => {
				await waitFor( () => fireEvent.click(iconElement));
				const buttonElement = await screen.findByTestId(
						"image-upload-icon"
				);
				await waitFor(() => userEvent.upload(buttonElement, image));
				await waitFor( () => expect(buttonElement.files[0]).toBe(image));
				await waitFor( () => expect(buttonElement.files).toHaveLength(1));
			});
		});

		
		it("should console.log if there is an error", async () => {
			server.use(
				rest.post(`https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`, (req, res, ctx) => {
					return res(
						ctx.status(500),
						ctx.json({}),
					);
				})
			);
			const iconElement = await screen.findByTestId("image-icon");
			fireEvent.click(iconElement)
      const image = new File(['testImage'], 'testImage.png', {type: 'image/png'})
      const buttonElement = await screen.findByTestId(
        "image-upload-icon"
      );
      await act(async () => {
				await waitFor( () => fireEvent.click(iconElement));
				const buttonElement = await screen.findByTestId(
						"image-upload-icon"
				);
				await waitFor(() => userEvent.upload(buttonElement, image));
			});
    });
	});
});
