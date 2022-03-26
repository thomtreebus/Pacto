const {upvote, downvote} = require("../../helpers/genericVoteMethods");
const { generateTestUser, getDefaultTestUserEmail} = require("../fixtures/generateTestUser");
const User = require("../../models/User");
const useTestDatabase = require("../helpers/useTestDatabase");

let obj = {
  upvoters: [],
  downvoters: [],
  votes: 0,
  save: () => {}
}
describe("Generic downvote", () => {
  useTestDatabase("genericDownvote");

  beforeEach(async () => {
    const user = await generateTestUser();
    user.active = true;
    await user.save();

    // Set object to blank
    obj.upvoters = [];
    obj.downvoters = [];
    obj.votes = 0;
  });

  it("handles standard downvote", async () => {
    const user = await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    const oldVotes = obj.votes;
    const oldUpvoterLen = obj.upvoters.length;
    const oldDownvoterLen = obj.downvoters.length;

    await downvote(obj, user);
    expect(obj.votes).toBe(oldVotes-1);
    expect(obj.downvoters.length).toBe(oldDownvoterLen+1);
    expect(obj.upvoters.length).toBe(oldUpvoterLen);
  });
  
  it("handles double downvote: keeping score the same", async () => {
    const user = await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    const oldVotes = obj.votes;
    const oldUpvoterLen = obj.upvoters.length;
    const oldDownvoterLen = obj.downvoters.length;

    await downvote(obj, user);
    await downvote(obj, user);
    expect(obj.votes).toBe(oldVotes);
    expect(obj.downvoters.length).toBe(oldDownvoterLen);
    expect(obj.upvoters.length).toBe(oldUpvoterLen);
  });

  it("handles downvote after upvoting", async () => {
    const user = await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    const oldVotes = obj.votes;
    const oldUpvoterLen = obj.upvoters.length;
    const oldDownvoterLen = obj.downvoters.length;

    await upvote(obj, user);
    await downvote(obj, user);
    expect(obj.votes).toBe(oldVotes-1);
    expect(obj.downvoters.length).toBe(oldDownvoterLen+1);
    expect(obj.upvoters.length).toBe(oldUpvoterLen);
  });
});