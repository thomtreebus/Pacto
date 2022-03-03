const Post = require("../models/Post");
const Pact = require("../models/Pact");
const University = require("../models/University");
const Comment = require("../models/Comment");
const User = require("../models/User");
const { jsonResponse, jsonError } = require("../helpers/responseHandlers");
const { POST_MESSAGES, MESSAGES } = require("../helpers/messages");
const { upvote, downvote } = require("../helpers/genericVoteMethods");

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
	let post = null;
	try {
		post = await Post.findOne({ pact: req.pact, _id:req.params.postId });
		try {
			await post.populate({ path: 'upvoters', model: User });
			await post.populate({ path: 'downvoters', model: User });
			await post.populate({ path: 'pact', model: Pact});
			await post.populate({ path: 'author', model: User});
			await post.populate({ path: 'comments', model: Comment});
			res.status(200).json(jsonResponse(post, []));
		} 
		catch (err) {
			res.status(400).json(jsonResponse(null, [jsonError(null, err.message)]));
		}
	}
	catch (err) {
		res.status(404).json(jsonResponse(null, [jsonError(null, POST_MESSAGES.NOT_FOUND)]));
	}
};

// POST upvote post
module.exports.upvotePostPost = async (req, res) => {
	try {
		// Checking post exists
		const post = await Post.findOne({ pact: req.pact, _id:req.params.postId });
		if (!post){
			res.status(404).json(jsonResponse(null, [jsonError(null, POST_MESSAGES.NOT_FOUND)]));
		} 
		else {
			upvote(post, req.user);

			// Populating before returning the post
			await post.populate({ path: 'upvoters', model: User });
			await post.populate({ path: 'downvoters', model: User });
			await post.populate({ path: 'pact', model: Pact});
			await post.populate({ path: 'author', model: User});
			await post.populate({ path: 'comments', model: Comment});
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
		} 
		else {
			downvote(post, req.user);

			// Populating before returning the post
			await post.populate({ path: 'upvoters', model: User });
			await post.populate({ path: 'downvoters', model: User });
			await post.populate({ path: 'pact', model: Pact});
			await post.populate({ path: 'author', model: User});
			await post.populate({ path: 'comments', model: Comment});
			res.status(200).json(jsonResponse(post, []));
		}
	} 
	catch (err) {
		console.log(err.message);
		res.status(400).json(jsonResponse(null, [jsonError(null, err.message)]));
	}
};

// DELETE post
module.exports.postDelete = async (req, res) => {
	let status = 400;
	try {
		let post = null;
		try {
			post = await Post.findOne({ pact: req.pact, _id:req.params.postId });
		} catch {
			post = null;
		}
		if(!post) {
			status = 404;
			throw Error(POST_MESSAGES.NOT_FOUND);
		}
		
		// Check user is the author or a mod
		if(post.author.toString() === req.user._id.toString() || req.pact.moderators.includes(req.user._id)) {
			// Delete post from pact's posts array
			const pact = await Pact.findOne( { id: post.pact });
			await pact.posts.pull({ _id: post._id  });
			await pact.save();

			// Delete post
			await Post.deleteOne( { _id: post._id } );
			res.status(204).json(jsonResponse(null, []));
			
		} else {
			status = 401;
			throw Error(POST_MESSAGES.NOT_AUTHORISED.NOT_AUTHOR_NOT_MOD);
		}		
	} 
	catch (err) {
		res.status(status).json(jsonResponse(null, [jsonError(null, err.message)]));
	}
};

