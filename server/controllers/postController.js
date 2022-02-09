const Post = require("../models/Post");
const Pact = require("../models/Pact");
const University = require("../models/University");
const User = require("../models/User");

// POST post
module.exports.postPost = async (req, res) => {
	try {
    const user = req.user;
    const { title, text, image, link, type } = req.body;
    const post = await Post.create({ author:user, title, image, text, link, type });

    const pact = req.body.pact;
    await Pact.findByIdAndUpdate(pact, {$push: {posts: post}});

		res.status(201).json(jsonResponse(post, []));
	} 
  catch (err) {
		res.status(400).json(jsonResponse(null, [jsonError(null, err.message)]));
	}
};

// GET pact (by id)
module.exports.postGet = async (req, res) => {
	let status = 400;
	try {

		const post = await Post.findOne({ _id:req.params.id });

		if (!post){
			status = 404;
			throw Error("Post not found");
		}

		res.status(200).json(jsonResponse(pact, []));
	} 
  catch (err) {
		res.status(status).json(jsonResponse(null, [jsonError(null, err.message)]));
	}
};

