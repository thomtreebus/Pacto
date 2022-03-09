const mongoose = require("mongoose");
const dotenv = require("dotenv");
const supertest = require("supertest");
const bcrypt = require("bcrypt");
const app = require("../../app");
const { createToken } = require("../../controllers/authController");
const { generateTestUser, getTestUserEmail, generateNextTestUser } = require("../fixtures/generateTestUser");
const { generateTestPact, getTestPactId } = require("../fixtures/generateTestPact");
const { generateTestPost, getTestPostId } = require("../fixtures/generateTestPost");
const { jsonResponse } = require("../../helpers/responseHandlers");
const { MESSAGES, PACT_MESSAGES } = require("../../helpers/messages");
const University = require('../../models/University');
const User = require("../../models/User");
const Pact = require('../../models/Pact');

dotenv.config();

describe("POST /post/upvote/:pactid/:id", () => {
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
    // Makes user a member and mod of pact
    const pact = await generateTestPact(user);
    //Make other user a member of pact
    const secondUser = await generateNextTestUser("bob");
    secondUser.active = true;
    secondUser.pacts.push(pact._id);
    pact.members.push(secondUser._id);
    await secondUser.save();
    await pact.save();
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Pact.deleteMany({});
    await University.deleteMany({});
  });

  it("Truye is true", () => {
    expect(true).toBe(true);
  })

});