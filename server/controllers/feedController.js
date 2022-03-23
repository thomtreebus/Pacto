const Post = require("../models/Post");
const Pact = require("../models/Pact");
const User = require("../models/User");
const {jsonResponse, jsonError} = require("../helpers/responseHandlers");
const handleFieldErrors = require('../helpers/errorHandler');

module.exports.feedGET = async (req, res) => {
  try {
    const user = req.user;
    await user.populate({ path: 'pacts', model: Pact })
    const posts = await Post.find({ pact: { $in: user.pacts } }).sort({ createdAt: -1 });
    res.status(200).json(jsonResponse(posts, []));
  } catch (err) {
    res.status(400).json(jsonResponse(null, [jsonError(null, err.message)]));
  }
}