const mongoose = require("mongoose");
const dotenv = require("dotenv");
const supertest = require("supertest");
const app = require("../../app");

const { checkIsMemberOfPact } = require("../../middleware/pactMiddleware");
const { createToken } = require("../../controllers/authController");
const { MESSAGES } = require("../../helpers/messages");
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

  app.get("/mockRoute", checkAuthenticated, checkIsMemberOfPact, function (req, res) {
    res.status(200).json(jsonResponse(req.pact, []));
  });

});