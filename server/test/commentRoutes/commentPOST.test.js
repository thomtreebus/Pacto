const User = require("../../models/User");
const Notification = require("../../models/Notification");
const supertest = require("supertest");
const app = require("../../app");
const { generateTestUser, getDefaultTestUserEmail} = require("../fixtures/generateTestUser");
const { generateTestPact, getTestPactId } = require("../fixtures/generateTestPact");
const { generateTestPost, getTestPostId } = require("../fixtures/generateTestPost");
const { createToken } = require("../../controllers/authController");
const { PACT_MESSAGES, MESSAGES, COMMENT_MESSAGES } = require("../../helpers/messages");
const useTestDatabase = require("../helpers/useTestDatabase");
const Post = require("../../models/Post");
const Pact = require("../../models/Pact");
const Comment = require("../../models/Comment");

const COMMENT_TEXT = "This is my 1st comment.";

const COMMENT_NOTIFICATION = `Your post received a new comment`;

describe("POST /pact/:pactId/post/:postId/comment", () =>{
  useTestDatabase();

  beforeEach(async () => {
    const user = await generateTestUser();
    user.active = true;
    await user.save();

    const pact = await generateTestPact(user);
    await generateTestPost(user, pact);
  });

  const sendRequest = async (token, text, expStatus) => {
    const response = await supertest(app)
      .post(`/pact/${getTestPactId()}/post/${getTestPostId()}/comment`)
      .set("Cookie", [`jwt=${token}`])
      .send({text})
      .expect(expStatus);

    return response;
  }

  const sendRequestReplyComment = async (token, text, expStatus, commentId) => {
    const response = await supertest(app)
      .post(`/pact/${getTestPactId()}/post/${getTestPostId()}/comment/${ commentId }/reply`)
      .set("Cookie", [`jwt=${token}`])
      .send({text})
      .expect(expStatus);

    return response;
  }

  function commentOnCommentNotification(commentor) {
    return `${commentor.firstName} ${commentor.lastName} replied to your comment`;
  }

  const createCommentUser = async (name, pact) => {
    const commentUser = await generateTestUser(name);
    commentUser.active = true;
    await commentUser.pacts.push(pact);
    await commentUser.save();
    await pact.members.push(commentUser)
    await pact.save();
    return commentUser;
  }

  it("successfully creates a valid comment", async () =>{
    const user = await User.findOne({uniEmail: getDefaultTestUserEmail()});
    const token = createToken(user._id);

    const sentText = COMMENT_TEXT;
    const response = await sendRequest(token, sentText, 201);

    expect(response.body.errors.length).toBe(0);
    expect(response.body.message.text).toBe(sentText);
  });

  it("commenting on your own post does not send a notifiation", async () => {
    const user = await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    const token = createToken(user._id);
    const post = await Post.findOne({ _id: getTestPostId() });
    const author = await User.findOne({ _id: post.author });
    const beforeCount = author.notifications.length;

    const sentText = COMMENT_TEXT;
    const response = await sendRequest(token, sentText, 201);

    expect(response.body.errors.length).toBe(0);
    expect(response.body.message.text).toBe(sentText);

    const updatedAuthor = await User.findOne({ _id: post.author });
    const afterCount = updatedAuthor.notifications.length;
    expect(afterCount).toBe(beforeCount);

    const notification = await Notification.findOne({ user: author._id });
    expect(notification).toBeNull();
  })

  it("notify post author that comment has been created", async () => {
    const pact = await Pact.findById(getTestPactId());
    const commentUser = await createCommentUser("userTwo", pact);

    const postUser = await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    const token = createToken(commentUser._id);

    const beforeCount = postUser.notifications.length;

    const sentText = COMMENT_TEXT;
    // commentUser makes a comment on postUser's post.
    const response = await sendRequest(token, sentText, 201);

    expect(response.body.errors.length).toBe(0);
    expect(response.body.message.text).toBe(sentText);

    const updatedPostUser = await User.findOne({ _id: postUser._id });
    const afterCount = updatedPostUser.notifications.length;
    expect(afterCount).toBe(beforeCount+1);

    const notification = await Notification.findOne({ user: postUser._id });
    expect(notification).toBeDefined();
    expect(notification.text).toBe("Your post received a new comment");

  })

  it("sends a notification for a reply on a comment", async () => {
    const pact = await Pact.findById(getTestPactId());
    const postUser = await User.findOne({ uniEmail: getDefaultTestUserEmail() });
    const commentUser1 = await createCommentUser("commenterOne", pact);
    const commentUser2 = await createCommentUser("commenterTwo", pact);

    const beforeCountPostUser = postUser.notifications.length;
    const beforeCountcommentUser1 = commentUser1.notifications.length;
    const beforeCountcommentUser2 = commentUser2.notifications.length;

    const token1 = createToken(commentUser1._id);

    const sentText = COMMENT_TEXT;
    // commentUser1 makes a comment on postUser's post.
    const response = await sendRequest(token1, sentText, 201);
    expect(response.body.errors.length).toBe(0);
    expect(response.body.message.text).toBe(sentText);
    expect(response.body.message.childComments.length).toBe(0);

    const comment1id = response.body.message._id;

    const token2 = createToken(commentUser2._id);
    // the comment of commentUser1 is commented by commentUser2
    const response2 = await sendRequestReplyComment(token2, sentText, 201, comment1id);
    expect(response2.body.errors.length).toBe(0);
    expect(response2.body.message.text).toBe(sentText);

    const updatedComment1 = await Comment.findById(comment1id);
    expect(updatedComment1.childComments.length).toBe(1);
    expect(updatedComment1.childComments[0]._id.toString()).toBe(response2.body.message._id.toString());

    const updatedPostUser = await User.findOne({ _id: postUser._id });
    await updatedPostUser.populate({path: 'notifications', model: Notification});
    const postUserNotifications = updatedPostUser.notifications;
    // Should be 2 notifications in total
    expect(postUserNotifications.length).toBe(beforeCountPostUser+2);
    expect(postUserNotifications[beforeCountPostUser].text).toBe(COMMENT_NOTIFICATION);
    expect(postUserNotifications[beforeCountPostUser+1].text).toBe(COMMENT_NOTIFICATION);

    const updatedCommentUser1 = await User.findOne({ _id: commentUser1._id });
    await updatedCommentUser1.populate({path: 'notifications', model: Notification});
    const cpommentUser1Notifications = updatedCommentUser1.notifications;
    // Should be 1 notification in total
    expect(cpommentUser1Notifications.length).toBe(beforeCountcommentUser1+1);
    expect(cpommentUser1Notifications[beforeCountcommentUser1].text).toBe(commentOnCommentNotification(commentUser2));

    const updatedCommentUser2 = await User.findOne({ _id: commentUser2._id });
    await updatedCommentUser2.populate({path: 'notifications', model: Notification});
    const cpommentUser2Notifications = updatedCommentUser2.notifications;
    // Should be 0 notification
    expect(cpommentUser2Notifications.length).toBe(beforeCountcommentUser2);

    const notifications = await Notification.find({ });
    expect(notifications.length).toBe(3);
  })

  it("rejects blank comment", async () =>{
    const user = await User.findOne({uniEmail: getDefaultTestUserEmail()});
    const token = createToken(user._id);

    const sentText = "";
    const response = await sendRequest(token, sentText, 400);

    expect(response.body.errors.length).toBe(1);
    expect(response.body.errors[0].message).toBe(COMMENT_MESSAGES.BLANK);
  });

  it("trims whitespace from text", async () =>{
    const user = await User.findOne({uniEmail: getDefaultTestUserEmail()});
    const token = createToken(user._id);

    const sentText = "x".repeat(512) + " ";
    const response = await sendRequest(token, sentText, 201);
  });

  it("accepts 512 char comment", async () =>{
    const user = await User.findOne({uniEmail: getDefaultTestUserEmail()});
    const token = createToken(user._id);

    const sentText = "x".repeat(512);
    const response = await sendRequest(token, sentText, 201);
  });

  it("rejects 513 char comment", async () =>{
    const user = await User.findOne({uniEmail: getDefaultTestUserEmail()});
    const token = createToken(user._id);

    const sentText = "x".repeat(513);
    const response = await sendRequest(token, sentText, 400);

    expect(response.body.errors.length).toBe(1);
    expect(response.body.errors[0].message).toBe(COMMENT_MESSAGES.MAX_LENGTH_EXCEEDED);
  });

  it("uses checkAuthenticated middleware", async () => {
    const token = "some gibberish";
    const sentText = COMMENT_TEXT;
    const response = await sendRequest(token, sentText, 401);

    expect(response.body.message).toBe(null);
    expect(response.body.errors[0].message).toBe(MESSAGES.AUTH.IS_NOT_LOGGED_IN);
  });

  it("uses checkIsMemberOfPact middleware", async () => {
    const user = await generateTestUser("David");
    user.active = true;
    await user.save();

    const token = createToken(user._id);
    const sentText = COMMENT_TEXT;
    const response = await sendRequest(token, sentText, 401);

    expect(response.body.message).toBe(null);
    expect(response.body.errors[0].message).toBe(PACT_MESSAGES.NOT_AUTHORISED);
  });
});
