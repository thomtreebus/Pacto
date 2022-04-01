const Comment = require("../models/Comment");
const User = require("../models/User");
const Notification = require("../models/Notification");
const {jsonResponse, jsonError} = require("../helpers/responseHandlers");
const handleFieldErrors = require('../helpers/errorHandler');
const { MESSAGES, COMMENT_MESSAGES } = require("../helpers/messages");
const { upvote, downvote } = require("../helpers/genericVoteMethods");

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

    await comment.populate({path: "author", model: User});
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

module.exports.commentPost = async (req, res) => {
  await makeComment(req,res);
}

module.exports.commentReplyPost = async (req, res) => {
  await makeComment(req,res,req.comment);
}

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
    await req.comment.populate({path: "parentComment", model: Comment});
    await req.comment.populate({path: "childComments", model: Comment});

    res.status(200).json(jsonResponse(req.comment, []));
  } catch(err){
    res.status(400).json(jsonResponse(null, [jsonError(null, err.message)]));
  }
}

module.exports.commentGet = async (req, res) => {
  try {
    const comment = req.comment;
    await comment.populate({path: "author", model: User});
    await comment.populate({path: "parentComment", model: Comment});
    await comment.populate({path: "childComments", model: Comment});
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
    await comment.populate({path: "parentComment", model: Comment});
    await comment.populate({path: "childComments", model: Comment});

    res.status(200).json(jsonResponse(comment, []));
  } catch(err){
    res.status(400).json(jsonResponse(null, [jsonError(null, err.message)]));
  }
}

module.exports.commentDownvotePut = async (req, res) => {
  try {
    const comment = req.comment;
    await downvote(comment, req.user);
    await comment.populate({path: "author", model: User});
    await comment.populate({path: "parentComment", model: Comment});
    await comment.populate({path: "childComments", model: Comment});

    res.status(200).json(jsonResponse(comment, []));
  } catch(err){
    res.status(400).json(jsonResponse(null, [jsonError(null, err.message)]));
  }
}