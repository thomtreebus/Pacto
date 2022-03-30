const Pact = require("../../models/Pact");
const Post = require("../../models/Post");
const University = require("../../models/University");
const User = require("../../models/User");
const Comment = require("../../models/Comment");
const supertest = require("supertest");
const app = require("../../app");
const { generateTestUser, getDefaultTestUserEmail } = require("../fixtures/generateTestUser");
const { createToken } = require("../../controllers/authController");
const { MESSAGES, PACT_MESSAGES } = require("../../helpers/messages");
const {generateTestPact, getTestPactId} = require("../fixtures/generateTestPact");
const useTestDatabase = require("../helpers/useTestDatabase");
const { generateTestPost } = require("../fixtures/generateTestPost");
const { generateTestComment } = require("../fixtures/genereateTestComment");

describe("DELETE /pact/:pact_id/delete", () => {
  useTestDatabase();

  beforeEach(async () => {
    const user = await generateTestUser();
    user.active = true;
    await user.save();

    await generateTestPact(user);
  });

  // Helpers
  const addMember = async (pact, member) => {
    await pact.members.push(member);
    await member.pacts.push(pact);
    await pact.save();
    await member.save();
  }

  const addModerator = async (pact, moderator) => {
    await pact.members.push(moderator);
    await pact.moderators.push(moderator);
    await moderator.pacts.push(pact);
    await pact.save();
    await moderator.save();
  }

  // Tests
  it("lets moderator alone in their pact delete it", async () =>{
    const founder =  await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    expect(founder.pacts.length).toBe(1);

    const pactId = getTestPactId();
    const pact = await Pact.findById(pactId);
    expect(pact.members.length).toBe(1);
    expect(pact.moderators.length).toBe(1);
    const uni = await University.findOne({});
    expect(uni.pacts.length).toBe(1);

    const token = createToken(founder._id);
    const response = await supertest(app)
    .delete(`/pact/${ pactId }/delete`)
    .set("Cookie", [`jwt=${token}`])
    .expect(201);
    expect(response.body.message).toBe(PACT_MESSAGES.DELETE.SUCCESSFUL);
    expect(response.body.errors.length).toBe(0);

    const founder2 =  await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    expect(founder2).toBeDefined();
    expect(founder2.pacts.length).toBe(0);
    const deletedPact = await Pact.findById(pactId);
    expect(deletedPact).toBeNull();
    const newUni = await University.findOne({});
    expect(newUni.pacts.length).toBe(0);
  });  

  it("Multiple members, 1 mod pact can be deleted by the moderator", async () =>{
    const founder =  await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    const user1 = await generateTestUser("userOne", "kcl");
    expect(user1.pacts.length).toBe(0);
    const user2 = await generateTestUser("userTwo", "kcl");
    const user3 = await generateTestUser("userThree", "kcl");
    const pactId = getTestPactId();
    const pact = await Pact.findById(pactId);
    await addMember(pact, user1);
    await addMember(pact, user2);
    await addMember(pact, user3);

    const user1updated = await User.findById(user1._id);
    expect(user1updated.pacts.length).toBe(1);

    const updatedPact = await Pact.findById(pactId);
    expect(updatedPact.members.length).toBe(4);
    expect(updatedPact.moderators.length).toBe(1);
    const uni = await University.findOne({});
    expect(uni.pacts.length).toBe(1);

    const token = createToken(founder._id);
    const response = await supertest(app)
    .delete(`/pact/${ pact._id }/delete`)
    .set("Cookie", [`jwt=${token}`])
    .expect(201);
    expect(response.body.message).toBe(PACT_MESSAGES.DELETE.SUCCESSFUL);
    expect(response.body.errors.length).toBe(0);

    const founder2 =  await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    expect(founder2).toBeDefined();
    const user1ver2 =  await User.findById(user1._id);
    expect(user1ver2).toBeDefined();
    expect(user1ver2.pacts.length).toBe(0);
    const user2ver2 =  await User.findById(user2._id);
    expect(user2ver2).toBeDefined();
    const user3ver2 =  await User.findById(user3._id);
    expect(user3ver2).toBeDefined();
    const deletedPact = await Pact.findById(pactId);
    expect(deletedPact).toBeNull();
    const newUni = await University.findOne({});
    expect(newUni.pacts.length).toBe(0);
  }); 

  it("Cannot delete if more than 1 mod", async () =>{
    const founder =  await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    const mod2 = await generateTestUser("modTwo", "kcl");
    const pactId = getTestPactId();
    const pact = await Pact.findById(pactId);
    await addModerator(pact, mod2);

    const updatedPact = await Pact.findById(pactId);
    expect(updatedPact.members.length).toBe(2);
    expect(updatedPact.moderators.length).toBe(2);

    const uni = await University.findOne({});
    expect(uni.pacts.length).toBe(1);

    const token = createToken(founder._id);
    const response = await supertest(app)
    .delete(`/pact/${ pact._id }/delete`)
    .set("Cookie", [`jwt=${token}`])
    .expect(401);
    expect(response.body.message).toBeDefined();
    expect(response.body.errors.length).toBe(1);
    expect(response.body.errors[0].field).toBe(null);
    expect(response.body.errors[0].message).toBe(PACT_MESSAGES.DELETE.TOO_MANY_MODERATORS);

    const founder2 =  await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    expect(founder2.pacts.length).toBe(1);
    const mod2ver2 =  await User.findById(mod2._id);
    expect(mod2ver2.pacts.length).toBe(1);
    const unchangedPact = await Pact.findById(pactId);
    expect(unchangedPact.members.length).toBe(2);
    expect(unchangedPact.moderators.length).toBe(2);
    const newUni = await University.findOne({});
    expect(newUni.pacts.length).toBe(1);
  }); 

  it("deletes posts of the pact", async () =>{
    const founder =  await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    expect(founder.pacts.length).toBe(1);
    const pactId = getTestPactId();
    const pact = await Pact.findById(pactId);
    const post1 = await generateTestPost(founder, pact);
    const post2 = await generateTestPost(founder, pact);

    const updatedPact = await Pact.findById(pactId);
    expect(updatedPact.posts.length).toBe(2);

    const token = createToken(founder._id);
    const response = await supertest(app)
    .delete(`/pact/${ pact._id }/delete`)
    .set("Cookie", [`jwt=${token}`])
    .expect(201);
    expect(response.body.message).toBe(PACT_MESSAGES.DELETE.SUCCESSFUL);
    expect(response.body.errors.length).toBe(0);

    const deletedPost1 =  await Post.findById(post1._id);
    expect(deletedPost1).toBeNull();
    const deletedPost2 =  await Post.findById(post2._id);
    expect(deletedPost2).toBeNull();
    const deletedPact = await Pact.findById(pactId);
    expect(deletedPact).toBeNull();
    const updatedFounder =  await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    expect(updatedFounder.pacts.length).toBe(0);
  }); 

  it("deletes comments of posts of the pact", async () =>{
    const founder =  await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    const pactId = getTestPactId();
    const pact = await Pact.findById(pactId);
    const post1 = await generateTestPost(founder, pact);
    const comment1 = await generateTestComment(founder, post1);
    const comment2 = await generateTestComment(founder, post1);
    const post2 = await generateTestPost(founder, pact);
    const comment3 = await generateTestComment(founder, post2);
    const comment4 = await generateTestComment(founder, post2);
    
    const updatedPact = await Pact.findById(pactId);
    expect(updatedPact.posts.length).toBe(2);
    await updatedPact.populate({path: 'posts', model: Post});
    expect(updatedPact.posts[0].comments.length).toBe(2);
    expect(updatedPact.posts[1].comments.length).toBe(2);

    const token = createToken(founder._id);
    const response = await supertest(app)
    .delete(`/pact/${ pact._id }/delete`)
    .set("Cookie", [`jwt=${token}`])
    .expect(201);
    expect(response.body.message).toBe(PACT_MESSAGES.DELETE.SUCCESSFUL);
    expect(response.body.errors.length).toBe(0);

    const deletedComment1 =  await Comment.findById(comment1._id);
    expect(deletedComment1).toBeNull();
    const deletedComment2 =  await Comment.findById(comment2._id);
    expect(deletedComment2).toBeNull();
    const deletedComment3 =  await Comment.findById(comment3._id);
    expect(deletedComment3).toBeNull();
    const deletedComment4 =  await Comment.findById(comment4._id);
    expect(deletedComment4).toBeNull();
    const deletedPost1 =  await Post.findById(post1._id); 
    expect(deletedPost1).toBeNull();
    const deletedPost2 =  await Post.findById(post2._id);
    expect(deletedPost2).toBeNull();
    const deletedPact = await Pact.findById(pactId);
    expect(deletedPact).toBeNull();
    const updatedFounder =  await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    expect(updatedFounder.pacts.length).toBe(0);
  }); 

  it("also deletes child comments of comments", async () =>{
    const founder =  await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    expect(founder.pacts.length).toBe(1);
    const pactId = getTestPactId();
    const pact = await Pact.findById(pactId);
    const post = await generateTestPost(founder, pact);
    const comment = await generateTestComment(founder, post);
    const childComment1 = await generateTestComment(founder);
    const childComment2 = await generateTestComment(founder);
    await comment.childComments.push(childComment1);
    await comment.childComments.push(childComment2);
    await comment.save();

    const updatedPact = await Pact.findById(pactId);
    expect(updatedPact.posts.length).toBe(1);
    await updatedPact.populate({ path: 'posts', model: Post });
    expect(updatedPact.posts[0].comments.length).toBe(1);
    const updatedComment = await Comment.findById(comment._id);
    expect(updatedComment.childComments.length).toBe(2);

    const token = createToken(founder._id);
    const response = await supertest(app)
    .delete(`/pact/${ pact._id }/delete`)
    .set("Cookie", [`jwt=${token}`])
    .expect(201);
    expect(response.body.message).toBe(PACT_MESSAGES.DELETE.SUCCESSFUL);
    expect(response.body.errors.length).toBe(0);

    const deletedPost =  await Post.findById(post._id); 
    expect(deletedPost).toBeNull();
    const deletedComment =  await Comment.findById(comment._id);
    expect(deletedComment).toBeNull();
    const deletedChildComment1 =  await Comment.findById(childComment1._id);
    expect(deletedChildComment1).toBeNull();
    const deletedChildComment2 =  await Comment.findById(childComment2._id);
    expect(deletedChildComment2).toBeNull();
    const deletedPact = await Pact.findById(pactId);
    expect(deletedPact).toBeNull();
    const updatedFounder =  await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    expect(updatedFounder.pacts.length).toBe(0);
  }); 

  it("uses checkAuthenticated middleware", async () =>{
    const token = "some gibberish";
    const pactId = await getTestPactId();

    const response = await supertest(app)
      .delete(`/pact/${ pactId }/delete`)
      .set("Cookie", [`jwt=${token}`])
      .expect(401);
    expect(response.body.message).toBeDefined();
    expect(response.body.errors.length).toBe(1);
    expect(response.body.errors[0].field).toBe(null);
    expect(response.body.errors[0].message).toBe(MESSAGES.AUTH.IS_NOT_LOGGED_IN);
  });

  it("uses checkIsMemberOfPact middleware", async () =>{
    const notMember = await generateTestUser("user", "kcl");
    notMember.active = true;
    await notMember.save();

    const pactId = getTestPactId();
    const token = createToken(notMember._id);
    const response = await supertest(app)
      .delete(`/pact/${ pactId }/delete`)
      .set("Cookie", [`jwt=${token}`])
      .expect(401);
    expect(response.body.message).toBeDefined();
    expect(response.body.errors.length).toBe(1);
    expect(response.body.errors[0].field).toBe(null);
    expect(response.body.errors[0].message).toBe(PACT_MESSAGES.NOT_AUTHORISED);
  });

  it("uses checkIsModeratorOfPact middleware", async () =>{
    const notMod = await generateTestUser("user", "kcl");
    notMod.active = true;
    await notMod.save();

    const pactId = getTestPactId();
    const pact = await Pact.findById(pactId);
    await addMember(pact, notMod);
    const token = createToken(notMod._id);
    const response = await supertest(app)
      .delete(`/pact/${ pactId }/delete`)
      .set("Cookie", [`jwt=${token}`])
      .expect(401);
    expect(response.body.message).toBeDefined();
    expect(response.body.errors.length).toBe(1);
    expect(response.body.errors[0].field).toBe(null);
    expect(response.body.errors[0].message).toBe(PACT_MESSAGES.NOT_MODERATOR);
  });
});