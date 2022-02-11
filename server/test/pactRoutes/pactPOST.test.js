const Pact = require("../../models/Pact");
const User = require("../../models/User");
const University = require("../../models/University");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const supertest = require("supertest");
const app = require("../../app");
const { generateTestUser, getEmail } = require("../fixtures/generateTestUser");
const { createToken } = require("../../controllers/authController");

dotenv.config();

// Magic values
const NAME = "My pact";
const DESCRIPTION = "This is my 1st pact."
const CATEGORY = "course";

const DEFAULT_DESCRIPTION = "A Pact that doesn't know what it wants to be...";
const DEFAULT_CATEFORY = "other";

describe("POST /pact", () => {
  beforeAll(async () => {
		await mongoose.connect(process.env.TEST_DB_CONNECTION_URL);
	});

	afterAll(async () => {
		await mongoose.connection.close();
	});

  beforeEach(async () => {
    const user = await generateTestUser();
    user.active = true;
    await user.save();
  });

	afterEach(async () => {
		await User.deleteMany({});
    await Pact.deleteMany({});
		await University.deleteMany({});
	});

  // Helpers
  const isInvalidPact = async (pactObject, expErrField, expErrMsg) => {
    const user = await User.findOne({ uniEmail: getEmail() });
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
    const user = await User.findOne({ uniEmail: getEmail() });
    const token = createToken(user._id);
    const response = await supertest(app)
      .post("/pact")
      .set("Cookie", [`jwt=${token}`])
      .send(pactObject)
      .expect(201);
    
    expect(response.body.message).toBeDefined();
    expect(response.body.message.university).toBe(user.university);
    expect(response.body.message.members[0]).toBe(user);
    expect(response.body.message.moderators[0]).toBe(user);
    expect(response.body.message.members.length).toBe(1);
    expect(response.body.message.moderators.length).toBe(1);
    expect(response.body.errors.length).toBe(0);

    return response;
  }

  // Tests
  it("accepts valid pact with no optional attributes", () =>{
    await isValidPact({
      name: NAME
    });
  });

  it("assigns default category and description if absent", () =>{
    const res = await isValidPact({
      name: NAME
    });

    expect(res.body.message.description).toBe(DEFAULT_DESCRIPTION);
    expect(res.body.message.category).toBe(DEFAULT_CATEFORY);
  });

  it("accepts valid pact with description", () =>{
    await isValidPact({
      name: NAME,
      description: DESCRIPTION 
    });
  });

  it("accepts valid pact with category", () =>{
    await isValidPact({
      name: NAME,
      category: CATEGORY 
    });
  });

  it("accepts valid pact with all optional attributes", () =>{
    await isValidPact({
      name: NAME,
      description: DESCRIPTION,
      category: CATEGORY 
    });
  });

  // describe("Name validation", () => {
  //   it("rejects when name is not unique")
  // });
});