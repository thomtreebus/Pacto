const mongoose = require("mongoose");
const dotenv = require("dotenv");
const supertest = require("supertest");
const app = require("../../app");
const {upvote, downvote} = require("../../helpers/genericVoteMethods");
const { generateTestUser, getTestUserEmail } = require("../fixtures/generateTestUser");
const User = require("../../models/User");

dotenv.config();

let obj = {
  upvoters: [],
  downvoters: [],
  votes: 0,
  save: () => {}
}
describe("Generic downvote", () => {
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

    // Set object to blank
    obj.upvoters = [];
    obj.downvoters = [];
    obj.votes = 0;
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  it("handles standard downvote", async () => {
    const user = await User.findOne({ uniEmail: getTestUserEmail() });
    const oldVotes = obj.votes;
    const oldUpvoterLen = obj.upvoters.length;
    const oldDownvoterLen = obj.downvoters.length;

    downvote(obj, user);
    expect(obj.votes).toBe(oldVotes-1);
    expect(obj.downvoters.length).toBe(oldDownvoterLen+1);
    expect(obj.upvoters.length).toBe(oldUpvoterLen);
  });

  it("handles double downvote: keeping score the same", async () => {
    const user = await User.findOne({ uniEmail: getTestUserEmail() });
    const oldVotes = obj.votes;
    const oldUpvoterLen = obj.upvoters.length;
    const oldDownvoterLen = obj.downvoters.length;

    downvote(obj, user);
    downvote(obj, user);
    expect(obj.votes).toBe(oldVotes);
    expect(obj.downvoters.length).toBe(oldDownvoterLen);
    expect(obj.upvoters.length).toBe(oldUpvoterLen);
  });

  it("handles downvote after upvoting", async () => {
    const user = await User.findOne({ uniEmail: getTestUserEmail() });
    const oldVotes = obj.votes;
    const oldUpvoterLen = obj.upvoters.length;
    const oldDownvoterLen = obj.downvoters.length;

    upvote(obj, user);
    downvote(obj, user);
    expect(obj.votes).toBe(oldVotes-1);
    expect(obj.downvoters.length).toBe(oldDownvoterLen+1);
    expect(obj.upvoters.length).toBe(oldUpvoterLen);
  });
  
});