const Pact = require("../../models/Pact");
const User = require("../../models/User");
const University = require("../../models/University");
const supertest = require("supertest");
const app = require("../../app");
const { generateTestUser, getDefaultTestUserEmail } = require("../fixtures/generateTestUser");
const { createToken } = require("../../controllers/auth");
const { PACT_MESSAGES } = require("../../helpers/messages");
const {generateTestPact, getTestPactId} = require("../fixtures/generateTestPact");
const useTestDatabase = require("../helpers/useTestDatabase");

// Magic values
const NAME = "My pact";
const DESCRIPTION = "This is my 1st pact."
const CATEGORY = "course";

describe("PUT /pact", () => {
  useTestDatabase();

  beforeEach(async () => {
    const user = await generateTestUser();
    user.active = true;
    await user.save();

    await generateTestPact(user);
  });

  // Helpers
  const isInvalidPact = async (pactObject, expErrField, expErrMsg) => {
    const user = await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    const id = await getTestPactId();
    const token = createToken(user._id);
    const response = await supertest(app)
      .put("/pact/"+id)
      .set("Cookie", [`jwt=${token}`])
      .send(pactObject)
      .expect(500);
    expect(response.body.message).toBe(null);
    expect(response.body.errors[0].field).toBe(expErrField);
    expect(response.body.errors[0].message).toBe(expErrMsg);
  }

  const isValidPact = async (pactObject) => {
    const user = await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    const id = await getTestPactId();
    const token = createToken(user._id);
    const response = await supertest(app)
      .put("/pact/"+id)
      .set("Cookie", [`jwt=${token}`])
      .send(pactObject)
      .expect(200)
    expect(response.body.message).toBe(null);
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
      const user = await User.findOne({ uniEmail: getDefaultTestUserEmail() });
      const pact2 = await generateTestPact(user, "jerome1")
      const pact3 = await generateTestPact(user, "jerome2")
      await isInvalidPact({
        name: "jerome1"
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

    it("rejects when description is blank", async () => {
      const res = await isInvalidPact({
        name: NAME,
        description: ""
      },"description", PACT_MESSAGES.DESCRIPTION.BLANK);
    });
  });

  describe("Category validation", () => {
    it("rejects when category is not a valid input", async () => {
      await isInvalidPact({
        name: NAME,
        category: "pactostuff"
      }, "category", PACT_MESSAGES.CATEGORY.INVALID_CHOICE);
    });

    it("rejects when category is blank", async () => {
      const res = await isInvalidPact({
        name: NAME,
        category: ""
      },"category",PACT_MESSAGES.CATEGORY.BLANK);
    });
  });

  describe("Permission checks", () => {
    it("Rejects request if user is not moderator", async () => {
      const user2 = await generateTestUser("user_one");
      user2.active = true;
      await user2.save();

      const user3 = await generateTestUser("user_two");
      user3.active = true;
      await user3.save();

      const user2Pact = await generateTestPact(user2, "user_two_pact");

      // add user3 to pact.
      user3.pacts.push(user2Pact);
      await user3.save();
      user2Pact.members.push(user3);
      await user2Pact.save();

      // user3 tries updating user2's pact.
      const user3Token = createToken(user3);
      const res = await supertest(app)
        .put("/pact/"+user2Pact._id)
        .set("Cookie", [`jwt=${user3Token}`])
        .send(user2Pact)
        .expect(401)

      expect(res.body.errors).toHaveLength(1);
      expect(res.body.errors[0]['field']).toBeNull();
      expect(res.body.errors[0]['message']).toBe(PACT_MESSAGES.NOT_MODERATOR)
    })
  });

});