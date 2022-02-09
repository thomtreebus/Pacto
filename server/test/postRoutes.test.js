const mongoose = require("mongoose");
const dotenv = require("dotenv");
const supertest = require("supertest");
const bcrypt = require("bcrypt");
const app = require("../app");

const { checkPartOfPact } = require("../middleware/checkPactMiddleware");
const { jsonResponse } = require("../helpers/responseHandlers");
const University = require('../models/University')
const User = require("../models/User");
const Pact = require('../models/Pact')
const Post = require('../models/Post')

dotenv.config();

const getTestPact = async () => {
  const uni = await University.create( { name: "kcl", domains: ["kcl.ac.uk"] });
  const uniEmail = "pac.to@kcl.ac.uk";
  const password = "Password123";
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create a test user
  const user = await User.create({
    firstName: "pac",
    lastName: "to",
    uniEmail: uniEmail,
    password: hashedPassword,
    university: uni,
    active: true
  });

  // Create a test pact
  const pact = await Pact.create({
    name: "Chess club",
    university: uni,
    category: "subject",
    members: [user],
    moderators: [user]
  })

  return pact;
}

const getNoMemberPact = async () => {
  const uni = await University.create( { name: "kcl", domains: ["kcl.ac.uk"] });

  // Create a test pact
  const pact = await Pact.create({
    name: "Chess club",
    university: uni,
    category: "subject"
  })

  return pact;
}

describe("Middlewares", () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.TEST_DB_CONNECTION_URL);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Post.deleteMany({});
    await Pact.deleteMany({});
  });

  describe("POST post", () => {
    it("can create post with valid pact id and user part of pact", async () => {
      const pact = getTestPact();
      const user = pact.members[0];
      const response = await supertest(app)
      .post("/post")
      .send({
        author: user,
        title: "title",
        text: "Dummy text",
        type: "Dummy Type",
        link: "somelink"
      })
      .expect(200);

      expect(response.body.message).toBeDefined();
      expect(response.body.message).toBe("no authenticated user");
      expect(response.body.errors.length).toBe(0);
    });
  });

  describe("GET post", () => {
    
  });
});