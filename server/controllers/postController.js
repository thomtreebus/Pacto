const Post = require("../models/Post");
const Pact = require("../models/Pact");
const University = require("../models/University");
const User = require("../models/User");
const { jsonResponse, jsonError } = require("../helpers/responseHandlers");

// POST post
module.exports.postPost = async (req, res) => {
	try {
    const user = req.user;
		const userUni = user.university;
    const { title, text, image, link, type } = req.body;
		// Also checking user is in pact, will throw an error if not found
		const pact = await Pact.findOne({ university:userUni, _id:req.params.pactid });
		const post = await Post.create({ author:user, pact, title, image, text, link, type });
		// Add post to the pact
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

		const postPact = post.pact;
		if(req.user.pacts.includes(postPact)) {
			res.status(200).json(jsonResponse(post, []));
		} else {
			res.status(status).json(jsonResponse(null, [jsonError(null, "User is not in pact")]));
		}		
		// populate upvoters and downvoters
	} 
  catch (err) {
		res.status(status).json(jsonResponse(null, [jsonError(null, err.message)]));
	}

	// POST upvote

	// POST downvote
};

