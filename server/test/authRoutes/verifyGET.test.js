const EmailVerificationCode = require("../../models/EmailVerificationCode");
const supertest = require("supertest");
const app = require("../../app");
const User = require("../../models/User");
const { generateTestUser, getDefaultTestUserEmail } = require('../fixtures/generateTestUser');
const { MESSAGES } = require("../../helpers/messages");
const useTestDatabase = require("../helpers/useTestDatabase");

// Magic values
const VERIFICATION_CODE = "kaushik12";

describe("GET /verify", () => {
  useTestDatabase();

  beforeEach(async () => {
    const user = await generateTestUser();
    await EmailVerificationCode.create({
      userId: user._id,
      code: VERIFICATION_CODE,
    });
  });

  // Helpers
  async function getVerifyWithCode(code) {
    const response = await supertest(app).get("/verify?code=" + code);

    return response;
  }

  async function isResponseUnsuccessful(response, msg = MESSAGES.VERIFICATION.INVALID_CODE) {
    expect(response.statusCode).toBe(400);
    expect(response.body.errors.length).toBe(1);
    expect(response.body.errors[0].message).toBe(msg);
  }

  async function isResponseSuccessful(response) {
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe(MESSAGES.VERIFICATION.SUCCESS_RESPONSE_WHOLE_BODY);
  }

  // Tests
  it("verifies inactive user with valid code", async () => {
    const response = await getVerifyWithCode(VERIFICATION_CODE);
    isResponseSuccessful(response);

    const user = await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    expect(user.active).toBe(true);
  });

  it("fails to verify inactive user with invalid code", async () => {
    const response = await getVerifyWithCode(VERIFICATION_CODE + "gibberish");
    isResponseUnsuccessful(response);

    const user = await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    expect(user.active).toBe(false);
  });

  it("fails to verify inactive user with no code param", async () => {
    const response = await getVerifyWithCode("");
    isResponseUnsuccessful(response, MESSAGES.VERIFICATION.MISSING_CODE);

    const user = await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    expect(user.active).toBe(false);
  });

  it("identifies already used code as invalid, with user object not affected", async () => {
    const response = await getVerifyWithCode(VERIFICATION_CODE);
    isResponseSuccessful(response);
    const user = await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    expect(user.active).toBe(true);

    const responseAfterSuccess = await getVerifyWithCode(VERIFICATION_CODE);
    isResponseUnsuccessful(responseAfterSuccess);
    expect(user.active).toBe(true);
  });
});