const { jsonResponse, jsonError } = require("../helpers/responseHandlers");
const { POST_MESSAGES, COMMENT_MESSAGES } = require("../helpers/messages");
const Post = require("../models/Post");
const Comment = require("../models/Comment");


// checkIsMemberOfPact must be run first.
module.exports.checkValidPost = async (req,res, next) => {
  let post = null;
  try {
    post = await Post.findOne({ pact: req.pact, _id: req.params.postId });
  } catch(err){
    post = null;
  }

  if(!post){
    res.status(404).json(jsonResponse(null, [jsonError(null, POST_MESSAGES.NOT_FOUND)]));
  } else {
    req.post = post;
    next();
  }
}

// checkValidPost must be run first.
module.exports.checkValidPostComment = async (req,res, next) => {
  let comment = null;
  try {
    comment = await Comment.findOne({ _id: req.params.commentId });
  } catch(err){
    comment = null;
  }

  if(comment && !req.post.comments.includes(comment._id)){
    comment = null;
  }

  if(!comment){
    res.status(404).json(jsonResponse(null, [jsonError(null, COMMENT_MESSAGES.NOT_FOUND)]));
  } 
  else if(comment.deleted){
    res.status(410).json(jsonResponse(null, [jsonError(null, COMMENT_MESSAGES.REMOVED)]));
  } 
  else {
    req.comment = comment;
    next();
  }
}