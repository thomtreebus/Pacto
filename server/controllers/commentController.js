const Pact = require("../models/Pact");
const Comment = require("../models/Comment");
const User = require("../models/User");
const Post = require("../models/Post");
const {jsonResponse, jsonError} = require("../helpers/responseHandlers");
const handleFieldErrors = require('../helpers/errorHandler');
const { MESSAGES, COMMENT_MESSAGES } = require("../helpers/messages");
const { upvote, downvote } = require("../helpers/genericVoteMethods");

/**
 * Adds a comment to a post using text information contained in the request.
 * @param {Request} req - The request containing the post
 * @param {Response} res - The response to the request
 * @param {Comment} [parentComment=undefined] - The parent comment
 * @returns A JSON response containing the created comment
 * @async
 */
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
      parentComment.childComments.push(comment);
      parentComment.save();
    }

    await comment.populate({path: "author", model: User});
    await comment.populate({path: "parentComment", model: Comment});

    return res.status(201).json(jsonResponse(comment, []));
  }
  catch(err) {
    return res.status(400).json(jsonResponse(null, handleFieldErrors(err)));
  }
}

/**
 * Adds a comment to a post using text information contained in the request.
 * @param {Request} req - The request
 * @param {Response} res - The response to the request
 * @async
 */
module.exports.commentPost = async (req, res) => {
  await makeComment(req,res);
}

/**
 * Adds a reply (a comment) to a comment of a post using 
 * text information contained in the request.
 * @param {Request} req - The request also containing the parent comment
 * @param {Response} res - The response to the request
 * @async
 */
module.exports.commentReplyPost = async (req, res) => {
  await makeComment(req,res,req.comment);
}

/**
 * Deletes a comment.
 * The user making the request must be the author of the comment,
 * or a moderator of the pact containing the comment.
 * @param {Request} req - The request
 * @param {Response} res - The response to the request
 * @async
 */
module.exports.commentDelete = async (req, res) => {
  if(!(req.pact.moderators.includes(req.user._id.toString()) || req.comment.author.toString()===req.user._id.toString())){
    res.status(401).json(jsonResponse(null, [jsonError(null, COMMENT_MESSAGES.NOT_AUTHORISED.MODIFY)]));
    return;
  }
  try {
    // Checks already done in middleware. This is safe.
    req.comment.deleted = true;
    req.comment.text = COMMENT_MESSAGES.DELETED_COMMENT_TEXT;

    await req.comment.save();

    await req.comment.populate({path: "author", model: User});

    res.status(200).json(jsonResponse(req.comment, []));
  } catch(err){
    res.status(400).json(jsonResponse(null, [jsonError(null, err.message)]));
  }
}

/**
 * Populates the author field of the comment given in
 * the request, and returns the comment in the response.
 * @param {Request} req - The request
 * @param {Response} res - The response to the request
 * @async
 */
module.exports.commentGet = async (req, res) => {
  try {
    const comment = req.comment;
    await comment.populate({path: "author", model: User});
    res.status(200).json(jsonResponse(comment, []));
  } catch(err){
    res.status(400).json(jsonResponse(null, [jsonError(null, err.message)]));
  }
}

/**
 * Upvotes a comment.
 * If the same user upvotes a comment twice, it counts as 0 upvote.
 * @param {Request} req - The request
 * @param {Response} res - The response to the request
 * @async
 */
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

/**
 * Downvotes a comment.
 * If the same user downvotes a comment twice, it counts as 0 downvote.
 * @param {Request} req - The request
 * @param {Response} res - The response to the request
 * @async
 */
module.exports.commentDownvotePut = async (req, res) => {
  try {
    const comment = req.comment;
    await downvote(comment, req.user);
    await comment.populate({path: "author", model: User});

    res.status(200).json(jsonResponse(comment, []));
  } catch(err){
    res.status(400).json(jsonResponse(null, [jsonError(null, err.message)]));
  }
}