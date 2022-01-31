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
  });

  describe("Authentification Middleware", () => {
    app.get("/mockRoute", checkAuthenticated, function (req, res) {
      res.status(200).json(jsonResponse(req.user, []));
    });

    it("rejects unauthorised access", async () => {
      let response = await supertest(app).get("/mockRoute");
      expect(response.body.message).toBe(null);
      expect(response.body.errors[0].field).toBe(null);
      expect(response.body.errors[0].message).toBe("You have to login");
      expect(response.body.errors.length).toBe(1);
    });

    it("rejects invalid token", async () => {
      let response = await supertest(app)
        .get("/mockRoute")
        .set("Cookie", ["jwt=wrong"]);
      expect(response.body.message).toBe(null);
      expect(response.body.errors[0].field).toBe(null);
      expect(response.body.errors[0].message).toBe("You have to login");
      expect(response.body.errors.length).toBe(1);
    });

    it("accepts authorised access", async () => {
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
      });

      const token = createToken(user._id);
      let response = await supertest(app)
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
  });

  describe("Not Authentificated Middleware", () => {
    app.get("/mockRoute2", checkNotAuthenticated, function (req, res) {
      res.status(200).json(jsonResponse("no authenticated user", []));
    });

    it("accepts non-authentificated access", async () => {
      let response = await supertest(app).get("/mockRoute2");
      expect(response.body.message).toBeDefined();
      expect(response.body.message).toBe("no authenticated user");
      expect(response.body.errors.length).toBe(0);
    });

    it("accepts invalid token", async () => {
      let response = await supertest(app)
        .get("/mockRoute2")
        .set("Cookie", ["jwt=wrong"]);
      expect(response.body.message).toBeDefined();
      expect(response.body.message).toBe("no authenticated user");
      expect(response.body.errors.length).toBe(0);
    });

    it("rejects authentificated access", async () => {
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
      });

      const token = createToken(user._id);
      let response = await supertest(app)
        .get("/mockRoute2")
        .set("Cookie", [`jwt=${token}`]);
        expect(response.body.message).toBe(null);
        expect(response.body.errors[0].field).toBe(null);
        expect(response.body.errors[0].message).toBe("You must not be logged in");
        expect(response.body.errors.length).toBe(1);
    });
  });
});
