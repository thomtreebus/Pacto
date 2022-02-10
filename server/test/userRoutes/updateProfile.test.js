const mongoose = require("mongoose");
const dotenv = require("dotenv");
const EmailVerificationCode = require("../models/EmailVerificationCode");
const supertest = require("supertest");
const bcrypt = require("bcrypt");
const app = require("../../app");
const Cookies = require("expect-cookies");
const { createToken } = require("../../controllers/authController");
const User = require("../../models/User");
const emailHandler = require('../../helpers/emailHandlers');
const { JsonWebTokenError } = require("jsonwebtoken");
const { MESSAGES } = require("../../helpers/messages")

describe("User routes", () => { 
  beforeAll(async () => {
    await mongoose.connect(process.env.TEST_DB_CONNECTION_URL);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  afterEach(async () => {
		await User.deleteMany({});
		await EmailVerificationCode.deleteMany({});
		await University.deleteMany({});
  });
  
  

});