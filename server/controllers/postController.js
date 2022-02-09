const Post = require("../models/Post");
const Pact = require("../models/Pact");
const University = require("../models/University");
const User = require("../models/User");

// POST post
module.exports.postPost = async (req, res) => {
	try {
    const user = req.user;
    const { pact, title, text, image, link, type } = req.body;
		const userPacts = await user.pacts.filter(userPact => userPact._id === pact._id);
		if(userPacts.length === 1) {
			const post = await Post.create({ author:user, pact=userPacts[0], title, image, text, link, type });
			await Pact.findByIdAndUpdate(pact, {$push: {posts: post}});
			res.status(201).json(jsonResponse(post, []));
		} else {
			res.status(400).json(jsonResponse(null, [jsonError(null, "User is not in pact")]));
		}
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
	} 
  catch (err) {
		res.status(status).json(jsonResponse(null, [jsonError(null, err.message)]));
	}
};

