const Pact = require("../../models/Pact");
const Post = require("../../models/Post");
const User = require("../../models/User");
const Comment = require("../../models/Comment");

let myComment = null;

module.exports.generateTestComment = async (commentingUser, post, text="Dummy text") => {
  if(!commentingUser.active){
    throw Error("The commenting user provided is not active");
  }

  const comment = await Comment.create({
    author: commentingUser,
    text: text
  });

  const post = await Post.findById(post._id);
  post.comments.push(comment);
  await post.save();

  myComment = comment;
  return comment;
}

// Return ID of most recent comment to be generated
module.exports.getTestCommentId = () => {
  if (myComment) {
    return myComment._id;
  } else {
    throw Error("Comment not generated");
  }
}