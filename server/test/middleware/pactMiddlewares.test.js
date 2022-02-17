const mongoose = require("mongoose");
const dotenv = require("dotenv");
const supertest = require("supertest");
const app = require("../../app");

const { checkIsMemberOfPact } = require("../../middleware/pactMiddleware");
const { createToken } = require("../../controllers/authController");
const { MESSAGES, PACT_MESSAGES } = require("../../helpers/messages");
const { generateTestUser, getEmail, generateNextTestUser } = require("../fixtures/generateTestUser");
const { generateTestPact, getTestPactId } = require("../fixtures/generateTestPact");
const User = require("../../models/User");
const Pact = require("../../models/Pact");

dotenv.config();

describe("CheckIsMemberOfPact Middleware", () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.TEST_DB_CONNECTION_URL);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await User.deleteMany({});
    await University.deleteMany({});
    await Pact.deleteMany({});
  });

  beforeEach(async () => {
    const user = await generateTestUser();
    const foundingUser = await generateNextTestUser("Dave");
    const pact = await generateTestPact(foundingUser);
  });

  app.get("/mockRoute/:id", checkAuthenticated, checkIsMemberOfPact, function (req, res) {
    res.status(200).json(jsonResponse(req.pact, []));
  });

  const getMock = async (id, expStatus) => {
    const user = User.findOne({ uniEmail: getEmail() });
    const token = createToken(user._id + 1);
    const response = await supertest(app)
      .get("/mockRoute")
      .set("Cookie", [`jwt=${ token }`])
      .expect(expStatus);

    return response;
  };

  // Tests
  it("rejects when user is not a member of the pact", async () =>{
    const res = await getMock(getTestPactId(), 401);
    expect(res.body.message).toBe(null);
    expect(res.body.errors[0].message).toBe(PACT_MESSAGES.NOT_AUTHORISED);
  });

  it("rejects when pact does not exist", async () =>{
    const res = await getMock(getTestPactId() + "x", 404);
    expect(res.body.message).toBe(null);
    expect(res.body.errors[0].message).toBe(PACT_MESSAGES.NOT_FOUND);
  });

});