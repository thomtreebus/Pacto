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
		// Checking user is in pact, will throw an error if not found
		const pact = await Pact.findOne({ university:userUni, _id:req.params.pactid });
		if (!pact.members.includes(user._id) || !pact){
			res.status(400).json(jsonResponse(null, [jsonError(null, "User is not in the pact they are trying to post into")]));
		} else {
			const post = await Post.create({ author:user, pact, title, image, text, link, type });
			// Add post to the pact
			await Pact.findByIdAndUpdate(pact, {$push: {posts: post}});
			res.status(201).json(jsonResponse(post, []));
		}
	} 
  catch (err) {
		res.status(400).json(jsonResponse(null, [jsonError(null, err.message)]));
	}
};

// GET pact (by id)
module.exports.postGet = async (req, res) => {
	try {
		const post = await Post.findOne({ pact: req.params.pactid, _id:req.params.id });
  	if (!post){
			res.status(404).json(jsonResponse(null, [jsonError(null, "Post not found")]));
		}
		const postPact = post.pact;
		if(req.user.pacts.includes(postPact._id)) {
			await post.populate({ path: 'upvoters', model: User });
			await post.populate({ path: 'downvoters', model: User });
			res.status(200).json(jsonResponse(post, []));
		} else {
			res.status(400).json(jsonResponse(null, [jsonError(null, "User is not in this pact")]));
		}
	} 
  catch (err) {
		res.status(400).json(jsonResponse(null, [jsonError(null, err.message)]));
	}

	// POST upvote

	// POST downvote
};

