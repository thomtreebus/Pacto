const supertest = require("supertest");
const app = require("../../app");
const { checkIsModeratorOfPact } = require("../../middleware/pactMiddleware");
const { checkAuthenticated } = require("../../middleware/authMiddleware");
const { createToken } = require("../../controllers/authController");
const {jsonResponse} = require("../../helpers/responseHandlers");
const { MESSAGES, PACT_MESSAGES } = require("../../helpers/messages");
const { generateTestUser, getDefaultTestUserEmail} = require("../fixtures/generateTestUser");
const { generateTestPact, getTestPactId } = require("../fixtures/generateTestPact");
const User = require("../../models/User");
const Pact = require("../../models/Pact");
const useTestDatabase = require("../helpers/useTestDatabase");

describe("CheckIsModeratorOfPact Middleware", () => {
  useTestDatabase("checkIsModeratorOfPact");

  beforeEach(async () => {
    const user = await generateTestUser();
    user.active = true;
    await user.save();

    const foundingUser = await generateTestUser("Dave");
    foundingUser.active = true;
    await foundingUser.save();

    const pact = await generateTestPact(foundingUser);
  });

  app.get("/mockRoute/:pactId", checkAuthenticated, checkIsModeratorOfPact, function (req, res) {
    res.status(200).json(jsonResponse(req.pact, []));
  });

  const getMock = async (id, expStatus) => {
    const user = await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    const token = createToken(user._id);
    const response = await supertest(app)
      .get("/mockRoute/" + id)
      .set("Cookie", [`jwt=${token}`])
      .expect(expStatus);
    return response;
  };

  // Tests
  it("rejects when user is not a moderator of the pact", async () =>{
    const res = await getMock(getTestPactId().toString(), 401);
    expect(res.body.message).toBe(null);
    expect(res.body.errors[0].message).toBe(PACT_MESSAGES.NOT_MODERATOR);
  });

  it("rejects when pact does not exist", async () =>{
    const res = await getMock(getTestPactId() + "x", 404);
    expect(res.body.message).toBe(null);
    expect(res.body.errors[0].message).toBe(PACT_MESSAGES.NOT_FOUND);
  });

  it("rejects when check authenticated not run prior", async () =>{
    app.get("/badMock/:pactId", checkIsModeratorOfPact, function (req, res) {
      res.status(200).json(jsonResponse(req.pact, []));
    });
    
    const user = await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    const token = createToken(user._id);
    const res = await supertest(app)
      .get("/badMock/" + getTestPactId())
      .set("Cookie", [`jwt=${token}`])
      .expect(401);

    expect(res.body.message).toBe(null);
    expect(res.body.errors[0].message).toBe(MESSAGES.AUTH.IS_NOT_LOGGED_IN);
  });

  it("accepts when user is member of requested pact", async () =>{
    const user = await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    const pact = await Pact.findById(getTestPactId());

    user.pacts.push(pact);
    await user.save();

    pact.members.push(user);
    await pact.save();

    pact.moderators.push(user);
    await pact.save();

    const res = await getMock(getTestPactId().toString(), 200);

    expect(res.body.message._id.toString()).toEqual(pact._id.toString());
    expect(res.body.errors.length).toBe(0);
  });
});