const Post = require("../../models/Post");
const Comment = require("../../models/Comment");

let myComment = null;

module.exports.generateTestComment = async (commentingUser, post=null, text="Dummy text") => {
  if(!commentingUser.active){
    throw Error("The commenting user provided is not active");
  }

  const comment = await Comment.create({
    author: commentingUser,
    text: text
  });

  if(post !== null) {
    const commentedPost = await Post.findById(post._id);
    commentedPost.comments.push(comment);
    await commentedPost.save();
  }

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