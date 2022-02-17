const Post = require("../models/Post");
const Pact = require("../models/Pact");
const University = require("../models/University");
const User = require("../models/User");
const { jsonResponse, jsonError } = require("../helpers/responseHandlers");
const { POST_MESSAGES } = require("../helpers/messages");

// POST post
module.exports.postPost = async (req, res) => {
	try {
    const user = req.user;
    const { title, text, image, link, type } = req.body;
		const pact = req.pact;

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
	try {
		const post = await Post.findOne({ pact: req.pact, _id:req.params.postId });
  	if (!post){
			res.status(404).json(jsonResponse(null, [jsonError(null, POST_MESSAGES.NOT_FOUND)]));
		}
		await post.populate({ path: 'upvoters', model: User });
		await post.populate({ path: 'downvoters', model: User });
		res.status(200).json(jsonResponse(post, []));
	} 
  catch (err) {
		res.status(400).json(jsonResponse(null, [jsonError(null, err.message)]));
	}
};

// POST upvote post
module.exports.upvotePostPost = async (req, res) => {
	try {
		// Checking post exists
		const post = await Post.findOne({ pact: req.pact, _id:req.params.postId });
		if (!post){
			res.status(404).json(jsonResponse(null, [jsonError(null, POST_MESSAGES.NOT_FOUND)]));
		} else {
			// Checking if user already upvoted or downvoted
			if(post.upvoters.includes(req.user._id)) {
				// Cancel upvote
				const index = post.upvoters.indexOf(req.user._id);
				if (index > -1) {
					post.upvoters.splice(index, 1); // 2nd parameter means remove one item only
					post.votes = post.votes - 1;
				} else {
					console.log("error in upvote post code");
				}
			} else {
				if(post.downvoters.includes(req.user._id)) {
					// remove downvote
					const index = post.downvoters.indexOf(req.user._id);
					if (index > -1) {
						post.downvoters.splice(index, 1);
						post.votes = post.votes + 1;
					} else {
						console.log("error in upvote post code");
					}
				}
				// just normal upvote
				post.upvoters.push(req.user._id);
				post.votes = post.votes + 1;
			}
			post.save()

			// Populating before returning the post
			await post.populate({ path: 'upvoters', model: User });
			await post.populate({ path: 'downvoters', model: User });
			res.status(200).json(jsonResponse(post, []));
		}
	} 
	catch (err) {
		res.status(400).json(jsonResponse(null, [jsonError(null, err.message)]));
	}
};

// POST downvote
module.exports.downvotePostPost = async (req, res) => {
	try {
		// Checking post exists
		const post = await Post.findOne({ pact: req.params.pactId, _id:req.params.postId });
		if (!post){
			res.status(404).json(jsonResponse(null, [jsonError(null, POST_MESSAGES.NOT_FOUND)]));
		} else {
			// Checking if user already upvoted or downvoted
			if(post.downvoters.includes(req.user._id)) {
				// Cancel downvote
				const index = post.downvoters.indexOf(req.user._id);
				if (index > -1) {
					post.downvoters.splice(index, 1); 
					post.votes = post.votes + 1;
				} else {
					console.log("error in downvote post code");
				}
			} else {
				if(post.upvoters.includes(req.user._id)) {
					// remove upvote
					const index = post.upvoters.indexOf(req.user._id);
					if (index > -1) {
						post.upvoters.splice(index, 1);
						post.votes = post.votes - 1;
					} else {
						console.log("error in upvote post code");
					}
				}
				// just normal downvote
				post.downvoters.push(req.user._id);
				post.votes = post.votes - 1;
			}
			post.save()

			// Populating before returning the post
			await post.populate({ path: 'upvoters', model: User });
			await post.populate({ path: 'downvoters', model: User });
			res.status(200).json(jsonResponse(post, []));
		}
	} 
	catch (err) {
		res.status(400).json(jsonResponse(null, [jsonError(null, err.message)]));
	}
};

// DELETE post
module.exports.postDelete = async (req, res) => {
	try {
		const post = await Post.findOne({ pact: req.pact, _id:req.params.postId });
		if (!post){
			res.status(404).json(jsonResponse(null, [jsonError(null, POST_MESSAGES.NOT_FOUND)]));
		}
		Post.deleteOne( { _id: post._id } );
		res.status(200).json(jsonResponse(post, []));
	} 
	catch (err) {
		res.status(400).json(jsonResponse(null, [jsonError(null, err.message)]));
	}
};

