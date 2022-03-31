const { jsonResponse, jsonError } = require("../helpers/responseHandlers");
const { POST_MESSAGES, COMMENT_MESSAGES } = require("../helpers/messages");
const Post = require("../models/Post");
const Comment = require("../models/Comment");


/**
 * IMPORTANT: checkIsMemberOfPact must be run first.
 * 
 * Middleware to check that the post is indeed a post of the pact given as a parameter of the request.
 * The post's id is given in the parameters of the request.
 * It adds the post field to the request if it passes the checks.
 * Returns an error if checkIsMemberOfPact is not run first, or the post is not found.
 * @param {Request} req - The request
 * @param {Response} res - The response to the request
 * @param {*} next - The next function to be executed
 * @async
 */
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

/**
 * IMPORTANT: checkValidPost must be run first.
 * 
 * Middleware to check that the comment is indeed a comment of the post given as a parameter of the request.
 * The comment's id is given in the parameters of the request.
 * It adds the comment field to the request if it passes the checks.
 * Returns an error if checkValidPost is not run first, or the comment is not found or it has been removed.
 * @param {Request} req - The request
 * @param {Response} res - The response to the request
 * @param {*} next - The next function to be executed
 * @async
 */
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