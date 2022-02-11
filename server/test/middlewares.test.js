const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");
const supertest = require("supertest");
const bcrypt = require("bcrypt");
const app = require("../app");

const { checkAuthenticated } = require("../middleware/authMiddleware");
const { checkNotAuthenticated } = require("../middleware/notAuthMiddleware");
const { jsonResponse } = require("../helpers/responseHandlers");
const { createToken } = require("../controllers/authController");
const University = require('../models/University');
const { MESSAGES } = require("../helpers/messages");
const {generateTestUser} = require("./fixtures/generateTestUser");

dotenv.config();

describe("Middlewares", () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.TEST_DB_CONNECTION_URL);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await User.deleteMany({});
    await University.deleteMany({});
  });

  describe("Authentication Middleware", () => {
    app.get("/mockRoute", checkAuthenticated, function (req, res) {
      res.status(200).json(jsonResponse(req.user, []));
    });

    it("rejects unauthorised access", async () => {
      const response = await supertest(app).get("/mockRoute");
      expect(response.body.message).toBe(null);
      expect(response.body.errors[0].field).toBe(null);
      expect(response.body.errors[0].message).toBe(MESSAGES.AUTH.IS_NOT_LOGGED_IN);
      expect(response.body.errors.length).toBe(1);
    });

    it("rejects invalid token", async () => {
      const response = await supertest(app)
        .get("/mockRoute")
        .set("Cookie", ["jwt=wrong"]);
      expect(response.body.message).toBe(null);
      expect(response.body.errors[0].field).toBe(null);
      expect(response.body.errors[0].message).toBe(MESSAGES.AUTH.IS_NOT_LOGGED_IN);
      expect(response.body.errors.length).toBe(1);
    });

    it("rejects valid token for nonexisting user", async () => {
      const user = await generateTestUser();
      
      const token = createToken(user._id + 1);
      const response = await supertest(app)
        .get("/mockRoute")
        .set("Cookie", [`jwt=${token}`]);
      expect(response.body.message).toBe(null);
      expect(response.body.errors[0].field).toBe(null);
      expect(response.body.errors[0].message).toBe(MESSAGES.AUTH.IS_NOT_LOGGED_IN);
      expect(response.body.errors.length).toBe(1);
    });

    it("accepts authorised access", async () => {
      const user = await generateTestUser();
      user.active = true;
      await user.save();

      const token = createToken(user._id);
      const response = await supertest(app)
        .get("/mockRoute")
        .set("Cookie", [`jwt=${token}`]);
      expect(response.body.message).toBeDefined();
      expect(response.body.message._id).toBeDefined();
      expect(response.body.message.firstName).toBeDefined();
      expect(response.body.message.lastName).toBeDefined();
      expect(response.body.message.uniEmail).toBeDefined();
      expect(response.body.message.password).toBeDefined();
      expect(response.body.errors.length).toBe(0);
    });

    it("rejects inactive user", async () => {
      const user = await generateTestUser();

      const token = createToken(user._id);
      let response = await supertest(app)
        .get("/mockRoute")
        .set("Cookie", [`jwt=${token}`]);
      expect(response.body.message).toBe(null);
      expect(response.body.errors[0].field).toBe(null);
      expect(response.body.errors[0].message).toBe(MESSAGES.AUTH.IS_INACTIVE);
      expect(response.body.errors.length).toBe(1);
    });
  });

  describe("Not Authenticated Middleware", () => {
    app.get("/mockRoute2", checkNotAuthenticated, function (req, res) {
      res.status(200).json(jsonResponse("no authenticated user", []));
    });

    it("accepts non-authenticated access", async () => {
      const response = await supertest(app).get("/mockRoute2");
      expect(response.body.message).toBeDefined();
      expect(response.body.message).toBe("no authenticated user");
      expect(response.body.errors.length).toBe(0);
    });

    it("accepts invalid token", async () => {
      const response = await supertest(app)
        .get("/mockRoute2")
        .set("Cookie", ["jwt=wrong"]);
      expect(response.body.message).toBeDefined();
      expect(response.body.message).toBe("no authenticated user");
      expect(response.body.errors.length).toBe(0);
    });

    it("rejects authenticated access", async () => {
      const user = await generateTestUser();
      user.active = true;
      await user.save();

      const token = createToken(user._id);
      const response = await supertest(app)
        .get("/mockRoute2")
        .set("Cookie", [`jwt=${token}`]);
        expect(response.body.message).toBe(null);
        expect(response.body.errors[0].field).toBe(null);
        expect(response.body.errors[0].message).toBe(MESSAGES.AUTH.IS_LOGGED_IN);
        expect(response.body.errors.length).toBe(1);
    });
  });
});
