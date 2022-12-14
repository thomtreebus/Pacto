const Comment = require("../models/Comment");
const User = require("../models/User");
const Notification = require("../models/Notification");
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
      text: text?.trim(),
      author: req.user._id,
      parentComment
    }

    const comment = await Comment.create(newComment);
    await comment.save();

    req.post.comments.push(comment);
    await req.post.save();

    if(parentComment){
      parentComment.childComments.push(comment);
      const user = req.user;
      if (req.user._id !== parentComment.author) {
        const notification = await Notification.create({
          user: parentComment.author,
          text: `${user.firstName} ${user.lastName} replied to your comment`
        });
        const a = await Notification.find({});
        await User.findByIdAndUpdate(parentComment.author, {$push: {notifications: notification._id}});
      }
      await parentComment.save();
    }

    await comment.populate({path: "author", model: User, select: ["firstName", "lastName"]});
    await comment.populate({path: "parentComment", model: Comment});
    await comment.populate({path: "childComments", model: Comment});

    if ((req.user._id.toString() !== req.post.author._id.toString())) {
      const parentCommentIsNotPostAuthor = parentComment && (parentComment.author !== req.post.author._id.toString())
      // if:  parent author is not defined ( Comment is replying directly to main post )
      // or if:  parent comment is not the post author ( post author already got the replied to your comment notification
      // so no need for a duplicate notification )
      // then: send the post author a notification saying there is a new comment on their post
      if(!parentComment || parentCommentIsNotPostAuthor ) {
        const notification = await Notification.create({
          user: req.post.author,
          text: `Your post received a new comment`
        });
        await User.findByIdAndUpdate(req.post.author, {$push: {notifications: notification._id}});
      }
    }

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
module.exports.createComment = async (req, res) => {
  await makeComment(req,res);
}

/**
 * Adds a reply (a comment) to a comment of a post using 
 * text information contained in the request.
 * @param {Request} req - The request also containing the parent comment
 * @param {Response} res - The response to the request
 * @async
 */
module.exports.createReplyToComment = async (req, res) => {
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
module.exports.deleteComment = async (req, res) => {
  if(!(req.pact.moderators.includes(req.user._id.toString()) || req.comment.author.toString()===req.user._id.toString())){
    res.status(401).json(jsonResponse(null, [jsonError(null, COMMENT_MESSAGES.NOT_AUTHORISED.MODIFY)]));
    return;
  }
  try {
    // Checks already done in middleware. This is safe.
    req.comment.deleted = true;
    req.comment.text = COMMENT_MESSAGES.DELETED_COMMENT_TEXT;

    await req.comment.save();

    await req.comment.populate(
      {
        path: "author",
        model: User,
        select: [
          "firstName",
          "lastName",
        ]
      }
    );
    await req.comment.populate({path: "parentComment", model: Comment});
    await req.comment.populate({path: "childComments", model: Comment});

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
module.exports.getComment = async (req, res) => {
  try {
    const comment = req.comment;
    await req.comment.populate(
      {
        path: "author",
        model: User,
        select: [
          "firstName",
          "lastName",
        ]
      }
    );
    await comment.populate({path: "parentComment", model: Comment});
    await comment.populate({path: "childComments", model: Comment});
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
module.exports.upvoteComment = async (req, res) => {
  try {
    const comment = req.comment;
    await upvote(comment, req.user);
    await req.comment.populate(
      {
        path: "author",
        model: User,
        select: [
          "firstName",
          "lastName",
        ]
      }
    );
    await comment.populate({path: "parentComment", model: Comment});
    await comment.populate({path: "childComments", model: Comment});

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
module.exports.downvoteComment = async (req, res) => {
  try {
    const comment = req.comment;
    await downvote(comment, req.user);
    await req.comment.populate(
      {
        path: "author",
        model: User,
        select: [
          "firstName",
          "lastName",
        ]
      }
    );
    await comment.populate({path: "parentComment", model: Comment});
    await comment.populate({path: "childComments", model: Comment});

    res.status(200).json(jsonResponse(comment, []));
  } catch(err){
    res.status(400).json(jsonResponse(null, [jsonError(null, err.message)]));
  }
}