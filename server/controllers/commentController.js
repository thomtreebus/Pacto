const Pact = require("../models/Pact");
const Comment = require("../models/Comment");
const User = require("../models/User");
const Post = require("../models/Post");
const {jsonResponse, jsonError} = require("../helpers/responseHandlers");
const handleFieldErrors = require('../helpers/errorHandler');
const { MESSAGES, COMMENT_MESSAGES } = require("../helpers/messages");
const { upvote, downvote } = require("../helpers/genericVoteMethods");

const makeComment = async(req, res, parentComment=undefined) => {
  try {
    const { text } = req.body;

    const newComment = {
      text,
      author: req.user._id,
      parentComment
    }

    const comment = await Comment.create(newComment);
    await comment.save();

    req.post.comments.push(comment);
    await req.post.save();

    if(parentComment){
      parentComment.childcomments.push(comment);
      parentComment.save();
    }

    await comment.populate({path: "author", model: User});

    return res.status(201).json(jsonResponse(comment, []));
  }
  catch(err) {
    console.log(6969, err)
    let jsonErrors = [];
    const allErrors = handleFieldErrors(err);
    if(allErrors.length !== 0){
			allErrors.forEach((myErr) => jsonErrors.push(myErr));
		} 
		else {
			jsonErrors.push(jsonError(null, err.message));
		}
    return res.status(400).json(jsonResponse(null, jsonErrors));
  }
}

module.exports.commentPost = async (req, res) => {
  await makeComment(req,res);
}

module.exports.commentReplyPost = async (req, res) => {
  await makeComment(req,res,req.comment);
}

module.exports.commentDelete = async (req, res) => {
  try {
    // Checks already done in middleware. This is safe.
    await Comment.deleteOne({ _id: req.comment._id });

    if(req.post){
      req.post.comments.pull(req.comment);
      await req.post.save();
    }
    res.status(204).json(jsonResponse(null, []));
  } catch(err){
    res.status(400).json(jsonResponse(null, [jsonError(null, err.message)]));
  }
}

module.exports.commentGet = async (req, res) => {
  try {
    const comment = req.comment;
    await comment.populate({path: "author", model: User});
    res.status(200).json(jsonResponse(comment, []));
  } catch(err){
    res.status(400).json(jsonResponse(null, [jsonError(null, err.message)]));
  }
}

module.exports.commentUpvotePut = async (req, res) => {
  try {
    const comment = req.comment;
    await upvote(comment, req.user);
    await comment.populate({path: "author", model: User});

    res.status(200).json(jsonResponse(comment, []));
  } catch(err){
    res.status(400).json(jsonResponse(null, [jsonError(null, err.message)]));
  }
}

module.exports.commentDownvotePut = async (req, res) => {
  try {
    const comment = req.comment;
    await ownvote(comment, req.user);
    await comment.populate({path: "author", model: User});

    res.status(200).json(jsonResponse(comment, []));
  } catch(err){
    res.status(400).json(jsonResponse(null, [jsonError(null, err.message)]));
  }
}