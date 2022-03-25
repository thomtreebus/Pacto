const Post = require("../models/Post");
const Pact = require("../models/Pact");
const {jsonResponse, jsonError} = require("../helpers/responseHandlers");
const User = require("../models/User");
const getPreview = require("../helpers/LinkCache")

module.exports.feedGET = async (req, res) => {
  try {
    const user = req.user;
    await user.populate({ path: 'pacts', model: Pact })
    const posts = await Post.find({ pact: { $in: user.pacts } }).sort({ createdAt: -1 });
    for(let i = 0; i < posts.length; i++) {
      const post = posts[i];
      await post.populate({ path: 'author', model: User });
      if (post.type === "link") {
				const preview = await getPreview(post.link);
				if (preview !== null) {
					post.text = preview.text;
					post.image = preview.image;
				}
			}
    }
    res.status(200).json(jsonResponse(posts, []));
  } catch (err) {
    res.status(400).json(jsonResponse(null, [jsonError(null, err.message)]));
  }
}