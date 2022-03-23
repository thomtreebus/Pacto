const Post = require("../models/Post");
const Pact = require("../models/Pact");
const {jsonResponse, jsonError} = require("../helpers/responseHandlers");
const User = require("../models/User");

module.exports.feedGET = async (req, res) => {
  try {
    const user = req.user;
    await user.populate({ path: 'pacts', model: Pact })
    const posts = await Post.find({ pact: { $in: user.pacts } }).sort({ createdAt: -1 });
    for(let i = 0; i < posts.length; i++) {
      await posts[i].populate({ path: 'author', model: User });
    }
    res.status(200).json(jsonResponse(posts, []));
  } catch (err) {
    res.status(400).json(jsonResponse(null, [jsonError(null, err.message)]));
  }
}