const Post = require("../models/Post");
const {jsonResponse, jsonError} = require("../helpers/responseHandlers");
const handleFieldErrors = require('../helpers/errorHandler');

module.exports.feedGET = async (req, res) => {
  try {
    let posts = []
    const user = req.user;
    for (let index = 0; index < user.pacts.length; index++) { 
      const pact = user.pacts[index];
      await pact.populate({ path: "posts", model: Post, populate: { path: "author", model: User } });
      posts = posts.concat(pact.posts);
    }
    
    res.status(200).json(jsonResponse(posts, []));
  } catch (err) {
    res.status(400).json(jsonResponse(null, [jsonError(null, err.message)]));
  }
}