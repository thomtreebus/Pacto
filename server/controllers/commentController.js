const Pact = require("../models/Pact");
const Comment = require("../models/Comment");
const User = require("../models/User");
const Post = require("../models/Post");
const {jsonResponse, jsonError} = require("../helpers/responseHandlers");
const handleFieldErrors = require('../helpers/errorHandler');
const { MESSAGES, COMMENT_MESSAGES } = require("../helpers/messages");

module.exports.commentPost = async (req, res) => {
  try {
    const { text } = req.body;

    const newComment = {
      text,
      author: req.user
    }

    const comment = await Comment.create(newComment);
    await comment.save();

    req.post.comments.push(comment);
    await req.post.save();

    await comment.populate({path: "author", model: User});

    res.status(201).json(jsonResponse(comment, []));
  }
  catch(err) {
    let jsonErrors = [];
    const allErrors = handleFieldErrors(err);
    if(allErrors){
			allErrors.forEach((myErr) => jsonErrors.push(myErr));
		} 
		else {
			jsonErrors.push(jsonError(null, err.message));
		}
    res.status(400).json(jsonResponse(null, jsonErrors));
  }
}