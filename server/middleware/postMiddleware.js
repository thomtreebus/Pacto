const { jsonResponse, jsonError } = require("../helpers/responseHandlers");
const { POST_MESSAGES } = require("../helpers/messages");
const Post = require("../models/Pact");

// checkIsMemberOfPact must be run first.
module.exports.checkValidPost = async (req,res, next) => {
  let post = null;
  try {
    post = await Post.findOne({ pact: req.pact, _id: req.params.postId });
  } catch(err){
    post = null;
  }

  if(!post){
    res.status(404).json(jsonResponse(null, jsonError(null, POST_MESSAGES.NOT_FOUND)));
  } else {
    req.post = post;
    next();
  }
}