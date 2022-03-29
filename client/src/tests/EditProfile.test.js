import { render, screen, fireEvent } from "@testing-library/react";
import { waitForElementToBeRemoved, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import MockComponent from "./utils/MockComponent";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { Route } from "react-router-dom";
import EditProfile from "../pages/EditProfile";
import userEvent from "@testing-library/user-event";
import {act} from "react-dom/test-utils";
import { useMockServer } from "./utils/useMockServer";


const testUser = {
  firstName: "pac",
  lastName: "to",
  friends: [],
  bio: "hello world",
  course: 'Digital arts',
  location: 'London',
  image: "https://res.cloudinary.com/djlwzi9br/image/upload/v1644581875/man1_qexxnb.jpg",
  university: { // data structure subject to change
    name: "King's College London",
  },
  _id: 1,
  instagram: "pactoInsta",
  linkedin: "pactoLinkedIn",
  phone: "07999999999",
}

describe("Edit Profile Page Tests", () => {
  const server = useMockServer();

  beforeEach(async () => {
    server.use(
      rest.get(`${process.env.REACT_APP_URL}/me`, (req, res, ctx) => {
        return res(
          ctx.json({ message: testUser, errors: [] })
        );
      }),
      rest.post(`https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`, (req, res, ctx) => {
        return res(
          ctx.status(201),
          ctx.json({}),
        );
      })
    );
  });

  beforeEach(async () => {
    render(
      <MockComponent>
          <EditProfile />
          <Route exact path="/profile">
            <h1>Redirected to profile</h1>
          </Route>
      </MockComponent>
    );
    await waitForElementToBeRemoved(() => screen.getByText("Loading"));
  });

  describe("Check elements are rendered", () => {
    it("should render the instagram field", async () => {
      const instagramField = await screen.findByRole("textbox", {
        name: "Instagram"
      });
      expect(instagramField).toBeInTheDocument();
      expect(instagramField.value).toBe("pactoInsta");
    });

    it("should render the Phone number field", async () => {
      const phoneNumberField = await screen.findByRole("textbox", {
        name: "Phone Number"
      });
      expect(phoneNumberField).toBeInTheDocument();
      expect(phoneNumberField.value).toBe("07999999999");
    });

    it("should render the LinkedIn field", async () => {
      const linkedInField = await screen.findByRole("textbox", {
        name: "LinkedIn"
      });
      expect(linkedInField).toBeInTheDocument();
      expect(linkedInField.value).toBe("pactoLinkedIn");
    });

    it("should render the Course field", async () => {
      const courseField = await screen.findByRole("textbox", {
        name: "Course"
      });
      expect(courseField).toBeInTheDocument();
      expect(courseField.value).toBe("Digital arts");
    });

    it("should render the Location field", async () => {
      const locationField = await screen.findByRole("textbox", {
        name: "Location"
      });
      expect(locationField).toBeInTheDocument();
      expect(locationField.value).toBe("London");
    });

    it("should render the Bio field", async () => {
      const bioField = await screen.findByRole("textbox", {
        name: "Bio"
      });
      expect(bioField).toBeInTheDocument();
      expect(bioField.value).toBe("hello world")
    });

    it("should render the select image icon button", async () => {
      const selectImageButton = await screen.findByTestId("image-upload-icon")
      expect(selectImageButton).toBeInTheDocument();
    });

    it("should render the update profile button", async () => {
      const updateProfileButton = await screen.findByRole("button", {
        name: "Update Profile"
      });
      expect(updateProfileButton).toBeInTheDocument();
    });

    it("should render the user's profile picture", async () => {
      const profilePicture = await screen.findByAltText("Profile Picture");
      expect(profilePicture).toBeInTheDocument();
      expect(profilePicture.getAttribute('src')).toBe("https://res.cloudinary.com/djlwzi9br/image/upload/v1644581875/man1_qexxnb.jpg");
    });

    it("should render the user's name", async () => {
      const usersName = await screen.findByText("pac to");
      expect(usersName).toBeInTheDocument();
    });

  });

  describe("Check interaction with elements", () => {
    it("should be able to type into instagram field", async () => {
      const inputElement = await screen.findByRole("textbox", {
        name: "Instagram",
      });
      const testValue = "pacto"
      fireEvent.change(inputElement, { target: { value: testValue } });
      expect(inputElement.value).toBe(testValue);
    });

    it("should be able to type into Phone field", async () => {
      const inputElement = await screen.findByRole("textbox", {
        name: "Phone Number",
      });
      const testValue = "07777777777";
      fireEvent.change(inputElement, { target: { value: testValue } });
      expect(inputElement.value).toBe(testValue);
    });

    it("should be able to type into LinkedIn field", async () => {
      const inputElement = await screen.findByRole("textbox", {
        name: "LinkedIn",
      });
      const testValue = "Pacto";
      fireEvent.change(inputElement, { target: { value: testValue } });
      expect(inputElement.value).toBe(testValue);
    });

    it("should be able to type into Course field", async () => {
      const inputElement = await screen.findByRole("textbox", {
        name: "Course",
      });
      const testValue = "Art";
      fireEvent.change(inputElement, { target: { value: testValue } });
      expect(inputElement.value).toBe(testValue);
    });

    it("should be able to type into Location field", async () => {
      const inputElement = await screen.findByRole("textbox", {
        name: "Location",
      });
      const testValue = "Antartica";
      fireEvent.change(inputElement, { target: { value: testValue } });
      expect(inputElement.value).toBe(testValue);
    });

    it("should be able to type into Bio field", async () => {
      const inputElement = await screen.findByRole("textbox", {
        name: "Bio",
      });
      const testValue = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
      fireEvent.change(inputElement, { target: { value: testValue } });
      expect(inputElement.value).toBe(testValue);
    })

    it("uploaded image contents should be saved as a state", async () => {
      server.use(
        rest.post(`https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`, (req, res, ctx) => {
          return res(
            ctx.status(201),
            ctx.json({
              url: "imageUrl",
              secure_url: "imageUrl",
            }),
          );
        })
      );
      const image = new File(['testImage'], 'testImage.png', {type: 'image/png'})
      const buttonElement = await screen.findByTestId(
        "image-upload-icon"
      );
      await act(async () => {
        await waitFor(() => userEvent.upload(buttonElement, image));
        await waitFor(() => {
          expect(buttonElement.files[0]).toBe(image);
          expect(buttonElement.files[0]).toBe(image);
          expect(buttonElement.files).toHaveLength(1);
        }); 
      });
    });

    it("uploaded image updates profile image shown", async () => {
      const imageUrl = "http://res.cloudinary.com/djlwzi9br/image/upload/v1644796162/qrbhfhmml4hwa5y0dvu9.png"
      server.use(
        rest.post(`https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`, (req, res, ctx) => {
          return res(
            ctx.status(201),
            ctx.json({
                url: imageUrl,
                secure_url: imageUrl,
            }),
          );
        })
      );

      const image = new File(['testImage'], 'testImage.png', {type: 'image/png'});
      const previousImage = (await screen.findByAltText("Profile Picture")).getAttribute('src');

      const buttonElement = await screen.findByTestId(
        "image-upload-icon"
      );


      await act( async () => {
        await waitFor(() => userEvent.upload(buttonElement, image));
        await waitFor(() => {
          const updatedImage = (screen.getByAltText("Profile Picture")).getAttribute('src');
          expect(updatedImage).toBe(imageUrl);
          expect(previousImage===updatedImage).toBe(false);
        }); 
      });
    });


    it("error during image upload doesn't update profile image shown", async () => {
      server.use(
        rest.post(`https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`, (req, res, ctx) => {
          return res(
            ctx.status(404),
            ctx.json({
            }),
          );
        })
      );

      const image = new File(['testImage'], 'testImage.png', {type: 'image/png'});
      const previousImage = (await screen.findByAltText("Profile Picture")).getAttribute('src');

      const buttonElement = await screen.findByTestId(
        "image-upload-icon"
      );


      await act( async () => {
        await waitFor(() => userEvent.upload(buttonElement, image));
        await waitFor(() => {
          const updatedImage = (screen.getByAltText("Profile Picture")).getAttribute('src');
          expect(previousImage===updatedImage).toBe(true);
        });
      });
    });


    it("update profile button sends post request", async () => {
      server.use(
        rest.put(`${process.env.REACT_APP_URL}/users/1`, (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              message: testUser,
              errors: [],
            })
          );
        })
      );
      const updateProfileButton = await screen.findByRole("button", {
        name: "Update Profile"
      });

      await waitFor(() => userEvent.click(updateProfileButton));
      await waitFor(() => {
        expect(window.location.pathname).toBe("/user/1");
      }); 
    });
  });

  describe("Handles field errors", () => {
    it("Shows instagram field error", async () => {
      const errMsg = "invalid instagram name"
      server.use(
        rest.put(`${process.env.REACT_APP_URL}/users/1`, (req, res, ctx) => {
          return res(
            ctx.status(400),
            ctx.json({
              message: '',
              errors: [
                {
                  field: "instagram",
                  message: errMsg
                }
              ],
            })
          );
        })
      );
      const updateProfileButton = await screen.findByRole("button", {
        name: "Update Profile"
      });
      await act( async () => {
        await waitFor(() => userEvent.click(updateProfileButton));
        await waitFor(() => {
          const screenErrorMessage = screen.getByText(errMsg);
          expect(screenErrorMessage).toBeInTheDocument();
        }); 
      });

    });

    it("Shows linkedin field error", async () => {
      const errMsg = "invalid linkedin name"
      server.use(
        rest.put(`${process.env.REACT_APP_URL}/users/1`, (req, res, ctx) => {
          return res(
            ctx.status(400),
            ctx.json({
              message: '',
              errors: [
                {
                  field: "linkedin",
                  message: errMsg
                }
              ],
            })
          );
        })
      );
      const updateProfileButton = await screen.findByRole("button", {
        name: "Update Profile"
      });
      await act( async () => {
        await waitFor(() => userEvent.click(updateProfileButton));
        await waitFor(() => {
          const screenErrorMessage = screen.getByText(errMsg);
          expect(screenErrorMessage).toBeInTheDocument();
        }); 
      });
    });

    it("Shows phone field error", async () => {
      const errMsg = "invalid phone number"
      server.use(
        rest.put(`${process.env.REACT_APP_URL}/users/1`, (req, res, ctx) => {
          return res(
            ctx.status(400),
            ctx.json({
              message: '',
              errors: [
                {
                  field: "phone",
                  message: errMsg
                }
              ],
            })
          );
        })
      );
      const updateProfileButton = await screen.findByRole("button", {
        name: "Update Profile"
      });
      await act( async () => {
        await waitFor(() => userEvent.click(updateProfileButton));
        await waitFor(() => {
          const screenErrorMessage = screen.getByText(errMsg);
          expect(screenErrorMessage).toBeInTheDocument();
        }); 
      });
    });

    it("Shows course field error", async () => {
      const errMsg = "invalid course name"
      server.use(
        rest.put(`${process.env.REACT_APP_URL}/users/1`, (req, res, ctx) => {
          return res(
            ctx.status(400),
            ctx.json({
              message: '',
              errors: [
                {
                  field: "course",
                  message: errMsg
                }
              ],
            })
          );
        })
      );
      const updateProfileButton = await screen.findByRole("button", {
        name: "Update Profile"
      });
      await act( async () => {
        await waitFor(() => userEvent.click(updateProfileButton));
        await waitFor(() => {
          const screenErrorMessage = screen.getByText(errMsg);
          expect(screenErrorMessage).toBeInTheDocument();
        }); 
      });
    });

    it("Shows location field error", async () => {
      const errMsg = "invalid location name"
      server.use(
        rest.put(`${process.env.REACT_APP_URL}/users/1`, (req, res, ctx) => {
          return res(
            ctx.status(400),
            ctx.json({
              message: '',
              errors: [
                {
                  field: "location",
                  message: errMsg
                }
              ],
            })
          );
        })
      );
      const updateProfileButton = await screen.findByRole("button", {
        name: "Update Profile"
      });
      await act( async () => {
        await waitFor(() => userEvent.click(updateProfileButton));
        await waitFor(() => {
          const screenErrorMessage = screen.getByText(errMsg);
          expect(screenErrorMessage).toBeInTheDocument();
        }); 
      });
    });

    it("Shows bio field error", async () => {
      const errMsg = "invalid bio name"
      server.use(
        rest.put(`${process.env.REACT_APP_URL}/users/1`, (req, res, ctx) => {
          return res(
            ctx.status(400),
            ctx.json({
              message: '',
              errors: [
                {
                  field: "bio",
                  message: errMsg
                }
              ],
            })
          );
        })
      );
      const updateProfileButton = await screen.findByRole("button", {
        name: "Update Profile"
      });
      await act( async () => {
        await waitFor(() => userEvent.click(updateProfileButton));
        await waitFor(() => {
          const screenErrorMessage = screen.getByText(errMsg);
          expect(screenErrorMessage).toBeInTheDocument();
        }); 
      });
    });
  });
});
