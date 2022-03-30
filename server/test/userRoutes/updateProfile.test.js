const supertest = require("supertest");
const app = require("../../app");
const { MESSAGES, USER_MESSAGES} = require("../../helpers/messages");
const { generateTestUser } = require("../fixtures/generateTestUser");
const {createToken} = require("../../controllers/authController");
const useTestDatabase = require("../helpers/useTestDatabase");

jest.mock("../../helpers/emailHandlers");

describe("Update Profile PUT", () => {
  useTestDatabase();

  // Generate a user and make it active. Then save it to the test database and return the user.
  async function generateActiveSavedTestUser(name = "pac"){
    const user = await generateTestUser();
    user.active = true;
    await user.save();
    return user
  }

  // Generates tokens and does a standard error check..
  async function checkValidInputResponse(user, jsonBody){
    const token = createToken(user._id)

    const response = await supertest(app)
      .put(`/users/${user._id}`)
      .set("Cookie", [`jwt=${token}`])
      .send(jsonBody);

    expect(response.body.message).not.toBeNull()
    expect(response.body.errors.length).toBe(0);
    // return response if you want to do additional checks
    return response;
  }


  it("returns an error when not logged in", async () => {
    const user = await generateActiveSavedTestUser();
    createToken(user._id);

   const response = await supertest(app).put(`/users/${user._id}`);
   expect(response.body.message).toBe(null);
   expect(response.body.errors[0].field).toBe(null);
   expect(response.body.errors[0].message).toBe(MESSAGES.AUTH.IS_NOT_LOGGED_IN);
   expect(response.body.errors.length).toBe(1);
  });

  it("returns an error when invalid user", async () => {
    const user = await generateActiveSavedTestUser();
    const token = createToken(user._id);

    const response = await supertest(app).put(`/users/99999999999999999999999999`).set("Cookie", [`jwt=${token}`]);
    expect(response.body.message).toBe(null);
    expect(response.body.errors[0].field).toBe(null);
    expect(response.body.errors[0].message).toBe(USER_MESSAGES.DOES_NOT_EXIST);
    expect(response.body.errors.length).toBe(1);
  });

  it("accepts uni email change", async () => {
    const user = await generateActiveSavedTestUser();

    const testInput = {
      uniEmail: "pac.to@ucl.ac.uk"
    }

    const response = await checkValidInputResponse(user, testInput)
  });

  it("accepts valid firstName change", async () => {
    const user = await generateActiveSavedTestUser();

    const testInput = {
      firstName: "john"
    }

    const response = await checkValidInputResponse(user, testInput)
  });

  it("accepts valid lastName change", async () => {
    const user = await generateActiveSavedTestUser();

    const testInput = {
      lastName: "doe"
    }

    const response = await checkValidInputResponse(user, testInput)
  });

  it("accepts valid course change", async () => {
    const user = await generateActiveSavedTestUser();

    const testInput = {
      course: "Mathematics"
    }

    const response = await checkValidInputResponse(user, testInput)
  });

  it("accepts valid bio change", async () => {
    const user = await generateActiveSavedTestUser();

    const testInput = {
      bio: "I don't like art"
    }

    const response = await checkValidInputResponse(user, testInput)
  });

  it("accepts valid image change", async () => {
    const user = await generateActiveSavedTestUser();

    const testInput = {
      image: "https://example.com/image3.jpg"
    }

    const response = await checkValidInputResponse(user, testInput)
  });

  it("accepts valid hobbies change", async () => {
    const user = await generateActiveSavedTestUser();

    const testInput = {
      hobbies: [
        "Hunting",
        "Eating rocks"
      ]
    }

    const response = await checkValidInputResponse(user, testInput)
  });

  it("accepts valid location change", async () => {
    const user = await generateActiveSavedTestUser();

    const testInput = {
      location: "Antarctica"
    }

    const response = await checkValidInputResponse(user, testInput)
  });

  it("accepts valid instagram change", async () => {
    const user = await generateActiveSavedTestUser();

    const testInput = {
      instagram: "myInsta"
    }

    const response = await checkValidInputResponse(user, testInput)
  });

  it("accepts valid linkedIn change", async () => {
    const user = await generateActiveSavedTestUser();

    const testInput = {
      linkedin: "myLinkedIn"
    }

    const response = await checkValidInputResponse(user, testInput)
  });

  it("accepts valid phone change", async () => {
    const user = await generateActiveSavedTestUser();

    const testInput = {
      phone: "+123456789012"
    }

    const response = await checkValidInputResponse(user, testInput)
  });

});
