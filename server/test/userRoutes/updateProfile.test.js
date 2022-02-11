const mongoose = require("mongoose");
const dotenv = require("dotenv");
const supertest = require("supertest");
const app = require("../../app");
const EmailVerificationCode = require("../../models/EmailVerificationCode");
const User = require("../../models/User");
const emailHandler = require('../../helpers/emailHandlers');
const { MESSAGES } = require("../../helpers/messages");
const { generateTestUser } = require("../fixtures/generateTestUser");

jest.mock("../../helpers/emailHandlers");
dotenv.config();

const REAL_UNI_EMAIL = "aaron.monte@kcl.ac.uk";
const FIRST_NAME = "John";
const LAST_NAME = "Doe";
const PASSWORD = "Password123";


const getTestUser = async () => {
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

  return user;
}

describe("Update Profile PUT", () => { 
  beforeAll(async () => {
    await mongoose.connect(process.env.TEST_DB_CONNECTION_URL);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  afterEach(async () => {
		await User.deleteMany({});
  });
  
  it("returns an error when not logged in", async () => {
    const user = await generateTestUser();
    user.active = true;
    await user.save();
    const token = createToken(user._id);

   const response = await supertest(app).put(`/${user._id}/updateProfile`);
      expect(response.body.message).toBe(null);
      expect(response.body.errors[0].field).toBe(null);
      expect(response.body.errors[0].message).toBe("You have to login");
      expect(response.body.errors.length).toBe(1);
  });

  it("accepts authorised access", async () => {
      const user = await getTestUser();

      const token = createToken(user._id);
      const response = await supertest(app)
        .put(`/${user._id}/updateProfile`)
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