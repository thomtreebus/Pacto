const Pact = require("../../models/Pact");
const User = require("../../models/User");
const University = require("../../models/University");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const supertest = require("supertest");
const app = require("../../app");
const { generateTestUser, getTestUserEmail } = require("../fixtures/generateTestUser");
const { generateTestPact, getTestPactId } = require("../fixtures/generateTestPact");
const { createToken } = require("../../controllers/authController");
const { PACT_MESSAGES } = require("../../helpers/messages");

describe("GET /pact/:id", () =>{
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

    await generateTestPact(user);
  });

	afterEach(async () => {
		await User.deleteMany({});
    await Pact.deleteMany({});
		await University.deleteMany({});
	});

  // Tests
  it("returns appropriate error when id invalid", async () =>{
    const user = await User.findOne({ uniEmail: getTestUserEmail() });

    const token = createToken(user._id);
    const id = "gibberish";

    const response = await supertest(app)
      .get("/pact/"+id)
      .set("Cookie", [`jwt=${token}`])
      .expect(404);

    expect(response.body.errors[0].message).toBe("Pact not found");
  });  

  it("returns pact relating to id given", async () =>{
    const user = await User.findOne({ uniEmail: getTestUserEmail() });

    const token = createToken(user._id);
    const id = await getTestPactId();

    const response = await supertest(app)
      .get("/pact/"+id.toString())
      .set("Cookie", [`jwt=${token}`])
      .expect(200);

    expect(response.body.message).toBeDefined();
  });  
});