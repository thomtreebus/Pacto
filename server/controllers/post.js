const Post = require("../models/Post");
const Pact = require("../models/Pact");
const Comment = require("../models/Comment");
const User = require("../models/User");
const Notification = require("../models/Notification");
const handleFieldErrors = require('../helpers/errorHandler');
const { jsonResponse, jsonError } = require("../helpers/responseHandlers");
const { POST_MESSAGES } = require("../helpers/messages");
const { upvote, downvote } = require("../helpers/genericVoteMethods");
const getPreview = require("../helpers/LinkCache");

/**
 * Creates a post using information given in the request.
 * @param {Request} req - The request
 * @param {Response} res - The response to the request
 * @async
 */
module.exports.createPost = async (req, res) => {
	try {
    const user = req.user;
    const { title, text, image, link, type } = req.body;
		const pact = req.pact;

		const post = await Post.create({ author:user, pact, title: title?.trim(), image, text: text?.trim(), link, type });
		// Add post to the pact
		await Pact.findByIdAndUpdate(pact, {$push: {posts: post}});
		res.status(201).json(jsonResponse(post, []));
	} 
  catch (err) {
		res.status(400).json(jsonResponse(null, handleFieldErrors(err)));
	}
};

/**
 * Returns a post using the id of the post given in the parameters
 * of the request.
 * It populates the pact, the author, and the comments of the post.
 * @param {Request} req - The request
 * @param {Response} res - The response to the request
 * @async
 */
module.exports.getPost = async (req, res) => {
	let post = null;
	try {
		post = await Post.findOne({ pact: req.pact, _id:req.params.postId });

		if (post.type === "link") {
			const preview = await getPreview(post.link);
			if (preview !== null) {
				post.text = preview.text;
				post.image = preview.image;
			}
		}

		try {
			await post.populate({ path: 'pact', model: Pact});
			await post.populate({ path: 'author', model: User});
			await post.populate({ path: 'comments', model: Comment, populate : 
				[{
					path: 'author',
					model: User
				},{
					path: 'childComments',
					model: Comment
				}] 
			});
			
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

/**
 * Upvotes a comment.
 * If the same user upvotes a comment twice, it counts as 0 upvote.
 * @param {Request} req - The request
 * @param {Response} res - The response to the request
 * @async
 */
module.exports.upvotePost = async (req, res) => {
	try {
		// Checking post exists
		const post = await Post.findOne({ pact: req.pact, _id:req.params.postId });
		if (!post){
			res.status(404).json(jsonResponse(null, [jsonError(null, POST_MESSAGES.NOT_FOUND)]));
		} else {
			await upvote(post, req.user);

			// Notify poster that their post has been upvoted
			await Notification.create({ user: post.author, text: `${req.user.firstName} ${req.user.lastName} upvoted your post in ${req.pact.name}` });

			// Populating before returning the post
			await post.populate({ path: 'pact', model: Pact});
			await post.populate({ path: 'author', model: User});
			await post.populate({ path: 'comments', model: Comment, populate : 
				[{
					path: 'author',
					model: User
				},{
					path: 'childComments',
					model: Comment
				}] 
			});

			res.status(200).json(jsonResponse(post, []));
		}
	} 
	catch (err) {
		res.status(400).json(jsonResponse(null, handleFieldErrors(err)));
	}
};

/**
 * Downvotes a post.
 * If the same user downvotes a post twice, it counts as 0 downvote.
 * @param {Request} req - The request
 * @param {Response} res - The response to the request
 * @async
 */
module.exports.downvotePost = async (req, res) => {
	try {
		// Checking post exists
		const post = await Post.findOne({ pact: req.params.pactId, _id:req.params.postId });
		if (!post){
			res.status(404).json(jsonResponse(null, [jsonError(null, POST_MESSAGES.NOT_FOUND)]));
		} 
		else {
			await downvote(post, req.user);

			// Populating before returning the post
			await post.populate({ path: 'pact', model: Pact});
			await post.populate({ path: 'author', model: User});
			await post.populate({ path: 'comments', model: Comment, populate : 
				[{
					path: 'author',
					model: User
				},{
					path: 'childComments',
					model: Comment
				}] 
			});

			res.status(200).json(jsonResponse(post, []));
		}
	} 
	catch (err) {
		res.status(400).json(jsonResponse(null, handleFieldErrors(err)));
	}
};

/**
 * Deletes a post.
 * To succeed, the user who made the request must be the author,
 * or a moderator of the pact in which the post was made.
 * @param {Request} req - The request
 * @param {Response} res - The response to the request
 * @async
 */
module.exports.deletePost = async (req, res) => {
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

