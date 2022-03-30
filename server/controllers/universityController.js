const User = require("../models/User");
const University = require("../models/University");
const Pact = require("../models/Pact");
const Post = require("../models/Post");
const { jsonResponse, jsonError } = require("../helpers/responseHandlers");

/**
 * Returns the university of the user.
 * @param {Request} req - The request
 * @param {Response} res - The response to the request
 * @async
 */
module.exports.universityGet = async (req, res) => {
	try {
		const uni = req.user.university;
		await uni.populate({ path: "users", model: User });
		await uni.populate({ path: "pacts", model: Pact });
		res.status(200).json(jsonResponse(uni, []));
	} catch (err) {
		res.status(400).json(jsonResponse(null, [jsonError(null, err.message)]));
	}
};

/**
 * Searches pacts, users and posts through the university of the user making the request
 * that matches the query string specified by the user making the request.
 * It returns a list of pacts, users and posts.
 * @param {Request} req - The request
 * @param {Response} res - The response to the request
 * @async
 */
module.exports.search = async (req, res) => {
	try {
		const searchQuery = req.params.query;
		const university = await University.findOne({ id: req.user.university });

		// Find all pacts matching the query string
		const pacts = await Pact.find({
			university: university._id,
			name: { $regex: new RegExp(searchQuery, "i") },
		});

		// Find all users who's name match the query string
		const partialMatchingUsers = await User.aggregate([
			{ $project: { name: { $concat: ["$firstName", " ", "$lastName"] } } },
			{ $match: { name: new RegExp(searchQuery, "i") } },
		]);
		const matchingUserIds = partialMatchingUsers.map((user) => user._id);
		const users = await User.find({ _id: { $in: matchingUserIds } });

		// Find all posts matching the query string
		const uniPacts = await Pact.find({ university: university._id });
		const posts = await Post.find({
			pact: { $in: uniPacts },
			title: { $regex: new RegExp(searchQuery, "i") },
		});

		// Populate pact in posts
		for (let i = 0; i < posts.length; i++) {
			const post = posts[i];
			await post.populate({ path: 'pact', model: Pact});
			await post.populate({ path: 'author', model: User});
		}
		const results = {
			pacts: pacts,
			users: users,
			posts: posts,
		};

		res.status(200).json(jsonResponse(results, []));
	} catch (err) {
		res.status(400).json(jsonResponse(null, [jsonError(null, err.message)]));
	}
};
