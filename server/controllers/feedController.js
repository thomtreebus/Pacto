const Post = require("../models/Post");
const Pact = require("../models/Pact");
const User = require("../models/User");
const {jsonResponse, jsonError} = require("../helpers/responseHandlers");
const handleFieldErrors = require('../helpers/errorHandler');

module.exports.feedGET = async (req, res) => {
  try {
    let posts = []
    const user = req.user;
    await user.populate({ path: 'pacts', model: Pact })
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