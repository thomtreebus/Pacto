const Pact = require("../../models/Pact");
const User = require("../../models/User");
const University = require("../../models/University");
const supertest = require("supertest");
const app = require("../../app");
const { generateTestUser, getDefaultTestUserEmail } = require("../fixtures/generateTestUser");
const { createToken } = require("../../controllers/auth");
const { PACT_MESSAGES } = require("../../helpers/messages");
const useTestDatabase = require("../helpers/useTestDatabase");

// Magic values
const NAME = "My pact";
const DESCRIPTION = "This is my 1st pact."
const CATEGORY = "course";

const DEFAULT_DESCRIPTION = "A Pact that doesn't know what it wants to be...";
const DEFAULT_CATEGORY = "other";

describe("POST /pact", () => {
  useTestDatabase();

  beforeEach(async () => {
    const user = await generateTestUser();
    user.active = true;
    await user.save();
  });

  // Helpers
  const isInvalidPact = async (pactObject, expErrField, expErrMsg) => {
    const user = await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    const token = createToken(user._id);
    const response = await supertest(app)
      .post("/pact")
      .set("Cookie", [`jwt=${token}`])
      .send(pactObject)
      .expect(400);
    
    expect(response.body.message).toBe(null);
    expect(response.body.errors[0].field).toBe(expErrField);
    expect(response.body.errors[0].message).toBe(expErrMsg);
  }

  const isValidPact = async (pactObject) => {
    const user = await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    const token = createToken(user._id);
    const response = await supertest(app)
      .post("/pact")
      .set("Cookie", [`jwt=${token}`])
      .send(pactObject)
      .expect(201);
    
    expect(response.body.message).toBeDefined();
    expect(response.body.message.university.toString()).toEqual(user.university.toString());
    expect(response.body.message.members[0].toString()).toEqual(user._id.toString());
    expect(response.body.message.moderators[0].toString()).toEqual(user._id.toString());
    expect(response.body.message.members.length).toBe(1);
    expect(response.body.message.moderators.length).toBe(1);
    expect(response.body.errors.length).toBe(0);

    const updatedUser = await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    expect(updatedUser.pacts.length).toBe(1);
    await updatedUser.populate({path: "university", model: University});
    expect(updatedUser.university.pacts.length).toBe(1);

    return response;
  }

  // Tests
  it("accepts valid pact with no optional attributes", async () =>{
    await isValidPact({
      name: NAME
    });
  });

  it("uses checkAuthenticated middleware", async () =>{
    await supertest(app)
      .post("/pact")
      .send({name: NAME})
      .expect(401);
  });

  it("assigns default category and description if absent", async () =>{
    const res = await isValidPact({
      name: NAME
    });

    expect(res.body.message.description).toBe(DEFAULT_DESCRIPTION);
    expect(res.body.message.category).toBe(DEFAULT_CATEGORY);
  });

  it("accepts valid pact with description", async () =>{
    await isValidPact({
      name: NAME,
      description: DESCRIPTION 
    });
  });

  it("accepts valid pact with category", async () =>{
    await isValidPact({
      name: NAME,
      category: CATEGORY 
    });
  });

  it("accepts valid pact with all optional attributes", async () =>{
    await isValidPact({
      name: NAME,
      description: DESCRIPTION,
      category: CATEGORY 
    });
  });

  describe("Name validation", () => {
    it("rejects when name is not unique within university", async () => {
      // Create valid pact with NAME
      await isValidPact({
        name: NAME
      });

      // Attempt to create pact with the same name
      await isInvalidPact({
        name: NAME
      }, "name", PACT_MESSAGES.NAME.NOT_UNIQUE);
    });

    it("accepts when name is not unique outside university", async () => {
      // Create valid pact with NAME in another uni
      const uni = await University.create({name: "Dummy Uni", domains:["dummy.ac.uk"]});
      //const user = await User.create({firstName: "John", lastName: "Doe", uniEmail: "johndoe@example.com", password: "Password123", university: uni});
      await Pact.create({name: NAME, university: uni, members:[], moderators:[]});

      // Attempt to create pact with the same name
      await isValidPact({
        name: NAME
      });
    });

    it("rejects when name exceeds 50 characters", async () => {
      await isInvalidPact({
        name: "x".repeat(51)
      }, "name", PACT_MESSAGES.NAME.MAX_LENGTH_EXCEEDED);
    });

    it("accepts when name is exactly 50 characters", async () => {
      await isValidPact({
        name: "x".repeat(50)
      });
    });

    it("rejects when name is shorter than 2 characters", async () => {
      await isInvalidPact({
        name: "x"
      }, "name", PACT_MESSAGES.NAME.MIN_LENGTH_NOT_MET);
    });

    it("rejects when name is blank", async () => {
      await isInvalidPact({
        name: ""
      }, "name", PACT_MESSAGES.NAME.BLANK);
    });
  });

  describe("Description validation", () => {
    it("rejects when description exceeds 255 characters", async () => {
      await isInvalidPact({
        name: NAME,
        description: "x".repeat(256)
      }, "description", PACT_MESSAGES.DESCRIPTION.MAX_LENGTH_EXCEEDED);
    });

    it("accepts when description is exactly 255 characters", async () => {
      await isValidPact({
        name: NAME,
        description: "x".repeat(255)
      });
    });

    it("handles when description is blank, by using default", async () => {
      const res = await isValidPact({
        name: NAME,
        description: ""
      });

      expect(res.body.message.description).toBe(DEFAULT_DESCRIPTION);
    });
  });

  describe("Category validation", () => {
    it("rejects when category is not a valid input", async () => {
      await isInvalidPact({
        name: NAME,
        category: "pactostuff"
      }, "category", PACT_MESSAGES.CATEGORY.INVALID_CHOICE);
    });

    it("handles when category is blank, using default", async () => {
      const res = await isValidPact({
        name: NAME,
        category: ""
      });

      expect(res.body.message.category).toBe(DEFAULT_CATEGORY);
    });
  });
});