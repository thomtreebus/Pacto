const mongoose = require("mongoose");
const dotenv = require("dotenv");
const supertest = require("supertest");
const app = require("../../app");
const University = require("../../models/University");
const EmailVerificationCode = require("../../models/EmailVerificationCode");
const User = require("../../models/User");
const emailHandler = require('../../helpers/emailHandlers');
const { MESSAGES } = require("../../helpers/messages");
const { generateTestUser } = require("../fixtures/generateTestUser");

jest.mock("../../helpers/emailHandlers");
dotenv.config();

// Magic values
const REAL_UNI_EMAIL = "aaron.monte@kcl.ac.uk";
const FIRST_NAME = "John";
const LAST_NAME = "Doe";
const PASSWORD = "Password123";

describe("POST /signup", () => {
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
    await EmailVerificationCode.deleteMany({});
		await University.deleteMany({});
	});

  // Helpers
  async function isInvalidCredentials(firstName, lastName, uniEmail, password, msg = INCORRECT_CREDENTIALS, field=null) {
    const response = await supertest(app)
      .post("/signup")
      .send({
        firstName,
        lastName,
        uniEmail,
        password,
      })
      .expect(400);

    expect(response.body.message).toBe(null);
    console.log(response.body);
    expect(response.body.errors[0].field).toBe(field);
    expect(response.body.errors[0].message).toBe(msg);
    let msgExists= false
    Object.values(response.body.errors).forEach(({message}) =>{
      if(message.includes(msg)){msgExists = true}
    });
    expect(msgExists).toBe(true);
    expect(response.body.errors.length).toBe(1);
  }

  async function isValidCredentials(firstName, lastName, uniEmail, password) {
    const response = await supertest(app)
      .post("/signup")
      .send({
        firstName,
        lastName,
        uniEmail,
        password,
      })
      .expect(201);
    expect(emailHandler.handleVerification).toHaveBeenCalled();
    expect(response.body.message).toBeDefined();
    expect(response.body.errors.length).toBe(0);
  }

  // Tests
  describe("First name validation", () => {
    it("rejects when blank", async () => {
      await isInvalidCredentials(
        "",
        LAST_NAME,
        REAL_UNI_EMAIL,
        PASSWORD,
        MESSAGES.FIRST_NAME.BLANK,
        "firstName"
      );
    });

    it("rejects when it contains numbers", async () => {
      await isInvalidCredentials(
        "123"+FIRST_NAME,
        LAST_NAME,
        REAL_UNI_EMAIL,
        PASSWORD,
        MESSAGES.FIRST_NAME.CONTAINS_NUMBERS,
        "firstName"
      );
    });

    it("rejects if longer than 50 characters", async () => {
      await isInvalidCredentials(
        "x".repeat(51),
        LAST_NAME,
        REAL_UNI_EMAIL,
        PASSWORD,
        MESSAGES.FIRST_NAME.MAX_LENGTH_EXCEEDED,
        "firstName"
      );
    });

    it("accepts if exactly 50 characters", async () => {
      await isValidCredentials(
        "x".repeat(50),
        LAST_NAME,
        REAL_UNI_EMAIL,
        PASSWORD
      );
    });
  })

  describe("Last name validation", () => {
    it("rejects when blank", async () => {
      await isInvalidCredentials(
        FIRST_NAME,
        "",
        REAL_UNI_EMAIL,
        PASSWORD,
        MESSAGES.LAST_NAME.BLANK,
        "lastName"
      );
    });
    it("rejects when it contains numbers", async () => {
      await isInvalidCredentials(
        FIRST_NAME,
        "123"+LAST_NAME,
        REAL_UNI_EMAIL,
        PASSWORD,
        MESSAGES.LAST_NAME.CONTAINS_NUMBERS,
        "lastName"
      );
    });
    it("rejects if longer than 50 characters", async () => {
      await isInvalidCredentials(
        FIRST_NAME,
        "x".repeat(51),
        REAL_UNI_EMAIL,
        PASSWORD,
        MESSAGES.LAST_NAME.MAX_LENGTH_EXCEEDED,
        "lastName"
      );
    });
    it("accepts if exactly 50 characters", async () => {
      await isValidCredentials(
        FIRST_NAME,
        "x".repeat(50),
        REAL_UNI_EMAIL,
        PASSWORD
      );
    });
  });

  describe("University email validation", () => {
    it("rejects when blank", async () => {
      await isInvalidCredentials(
        FIRST_NAME,
        LAST_NAME,
        "",
        PASSWORD,
        MESSAGES.EMAIL.BLANK,
        "uniEmail"
      );
    });

    it("rejects when not a uni-associated email", async () => {
      await isInvalidCredentials(
        FIRST_NAME,
        FIRST_NAME,
        "john.doe@example.com",
        PASSWORD,
        MESSAGES.EMAIL.UNI.NON_UNI_EMAIL,
        "uniEmail"
      );
    });

    it("rejects when invalid email format", async () => {
      await isInvalidCredentials(
        FIRST_NAME,
        LAST_NAME,
        "john.doe",
        PASSWORD,
        MESSAGES.EMAIL.INVALID_FORMAT,
        "uniEmail"
      );
    });

    it("rejects when email not unqiue", async () => {
      await isInvalidCredentials(
        FIRST_NAME,
        LAST_NAME,
        "pac.to@kcl.ac.uk",
        PASSWORD,
        MESSAGES.EMAIL.NOT_UNIQUE,
        "uniEmail"
      );
    })
  });

  it("accepts valid input", async () => {
    await isValidCredentials(
      FIRST_NAME,
      LAST_NAME,
      REAL_UNI_EMAIL,
      PASSWORD,
    );
  });

  it("handles upper case email", async () => {
    await isValidCredentials(
      FIRST_NAME,
      LAST_NAME,
      REAL_UNI_EMAIL.toUpperCase(),
      PASSWORD,
    );
  });

  describe("Password validation", () => {
    it("rejects when blank", async () => {
      await isInvalidCredentials(
        FIRST_NAME,
        LAST_NAME,
        REAL_UNI_EMAIL,
        "",
        MESSAGES.PASSWORD.BLANK,
        "password"
      );
    });

    it("rejects when longer than 64 characters", async () => {
      await isInvalidCredentials(
        FIRST_NAME,
        LAST_NAME,
        REAL_UNI_EMAIL,
        "P1" + "a".repeat(63),
        MESSAGES.PASSWORD.MAX_LENGTH_EXCEEDED,
        "password"
      );
    });

    it("accepts when 64 characters", async () => {
      await isValidCredentials(
        FIRST_NAME,
        LAST_NAME,
        REAL_UNI_EMAIL,
        "P1" + "a".repeat(62)
      );
    });

    it("rejects when below 8 characters", async () => {
      await isInvalidCredentials(
        FIRST_NAME,
        LAST_NAME,
        REAL_UNI_EMAIL,
        "Pass123", // 7 chars
        MESSAGES.PASSWORD.MIN_LENGTH_NOT_MET,
        "password"
      );
    });

    it("accepts when 8 characters", async () => {
      await isValidCredentials(
        FIRST_NAME,
        LAST_NAME,
        REAL_UNI_EMAIL,
        "Passw123" // 8 chars
      );
    });

    it("rejects when does not contain number", async () => {
      await isInvalidCredentials(
        FIRST_NAME,
        LAST_NAME,
        REAL_UNI_EMAIL,
        "Password",
        MESSAGES.PASSWORD.NO_NUMBERS,
        "password"
      );
    });

    it("rejects when does not contain capital letter", async () => {
      await isInvalidCredentials(
        FIRST_NAME,
        LAST_NAME,
        REAL_UNI_EMAIL,
        "passsword123",
        MESSAGES.PASSWORD.NO_UPPERCASE,
        "password"
      );
    });

    it("rejects when does not contain lowercase character", async () => {
      await isInvalidCredentials(
        FIRST_NAME,
        LAST_NAME,
        REAL_UNI_EMAIL,
        "PASSWORD123",
        MESSAGES.PASSWORD.NO_LOWERCASE,
        "password"
      );
    });
  });
});