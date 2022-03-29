const Pact = require("../models/Pact");
const University = require("../models/University");
const User = require("../models/User");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const {jsonResponse, jsonError} = require("../helpers/responseHandlers");
const handleFieldErrors = require('../helpers/errorHandler');
const { MESSAGES, PACT_MESSAGES } = require("../helpers/messages");
const getPreview = require("../helpers/LinkCache");

/**
 * Creates a pact using information given in the request.
 * @param {Request} req - The request
 * @param {Response} res - The response to the request
 * @async
 */
module.exports.pactPost = async (req, res) => {
	try {
		const user = req.user;
    const { name } = req.body;
    const optionalAttributes = ['description', 'category'];

		const newPact = {
			name,
			university:user.university,
		  members:[user],
			moderators:[user]
		}

		// If the attribute is in the body we can add it otherwise leave undefined
		// If it is undefined mongo will use default values
		optionalAttributes.forEach((attribute) => {
			req.body[attribute] && (newPact[attribute] = req.body[attribute]);
		});

    const pact = await Pact.create(newPact);

		user.pacts.push(pact);
		await user.save();

		user.university.pacts.push(pact);
		await user.university.save();

		await pact.populate({ path: 'university', model: University });
		await pact.populate({ path: "members", model: User });
		await pact.populate({ path: "moderators", model: User });
		await pact.populate({ path: "posts", model: Post });

		res.status(201).json(jsonResponse(pact, []));
	}
  catch (err) {
		res.status(400).json(jsonResponse(null, handleFieldErrors(err)));
	}
};

/**
 * Returns a pact in the response in JSON format, using 
 * the (pact) id provided in the request.
 * The university, members, moderators, banned users, and posts
 * fields of the pact gets populated.
 * @param {Request} req - The request
 * @param {Response} res - The response to the request
 * @async
 */
module.exports.pactGet = async (req, res) => {
	try {
		const pact = req.pact;
		await pact.populate({
			path: 'university',
			model: University,
			select: ["name"]
		});
		await pact.populate({
			path: "members",
			model: User,
			select: ["firstName", "lastName", "course", "university", "image"]
		});
		await pact.populate({
			path: "moderators",
			model: User,
			select: ["firstName", "lastName", "course", "university", "image"]
		});
		await pact.populate({
			path: "bannedUsers",
			model: User,
			select: ["firstName", "lastName", "course", "university", "image"]
		});
		await pact.populate({
			path: "posts",
			model: Post,
			populate: [{
				path: "author",
				model: User,
				select: ["firstName", "lastName", "course", "university"]
			},
				{
					path: "pact", model: Pact
				}]
		});

		for (let index = 0; index < pact.posts.length; index++) {
			const post = pact.posts[index];
			if (post.type === "link") {
				const preview = await getPreview(post.link);
				if (preview !== null) {
					post.text = preview.text;
					post.image = preview.image;
				}
			}
		}

		res.status(200).json(jsonResponse(pact, []));
	}
  catch (err) {
		res.status(400).json(jsonResponse(null, [jsonError(null, err.message)]));
	}
};


/**
 * Updates information about the pact.
 * It fails if the user making the request is not a moderator of the pact.
 * @param {Request} req - The request
 * @param {Response} res - The response to the request
 * @async
 */
module.exports.pactPut = async(req, res) => {
	let status = undefined;
	const jsonErrors = [];
	let resMessage = null;
	try {
		const pact = req.pact
		const moderators = pact.moderators;

		// Checks if user can update the pact ( is a moderator )
		if (!moderators.includes(req.user._id)){
			status = 401
			throw Error(PACT_MESSAGES.NOT_MODERATOR);
		}

		const updatedPact = await Pact.findByIdAndUpdate(pact.id, { ...req.body }, { runValidators: true });
		status = 200

	} catch (err) {
		// When status code is not defined use status 500
		if(!status){
			status = 500
		}
		// converts error array into json array.
		const fieldErrors = handleFieldErrors(err);
		if(fieldErrors.length !== 0){
			fieldErrors.forEach((myErr) => jsonErrors.push(myErr));
		}
		else {
			jsonErrors.push(jsonError(null, err.message));
		}
	}
	finally {
		res.status(status).json(jsonResponse(resMessage, jsonErrors));
	}
}

/**
 * Makes the user who made the request join a pact.
 * The pact's id is given in the parameters of the request.
 * @param {Request} req - The request
 * @param {Response} res - The response to the request
 * @async
 */
module.exports.joinPact = async (req, res) => {

	try {
		const potentialPacts = req.user.university.pacts.filter(pact => pact._id.toString() === req.params.id);

		if(!potentialPacts.length){
			throw Error(PACT_MESSAGES.NOT_FOUND);
		}

		const targetUser = await User.findById(req.user._id);
		const targetPact = await Pact.findById(req.params.id);

		if(targetPact.bannedUsers.includes(targetUser._id)) {
			throw Error(PACT_MESSAGES.IS_BANNED_USER);
		}

		if (!targetUser.pacts.includes(targetPact._id) && !targetPact.members.includes(targetUser._id)) {
			targetUser.pacts.push(targetPact);
			targetPact.members.push(targetUser);

			await targetPact.save();
			await targetUser.save();
		}

		res.json(jsonResponse(PACT_MESSAGES.SUCCESSFUL_JOIN, []));
	}
	catch (err) {
		res.status(404).json(jsonResponse(null, [jsonError(null, err.message)]));
	}
};

/**
 * Bans a member of the pact.
 * The request must be made by a moderator, and another
 * moderator cannot be banned.
 * @param {Request} req - The request
 * @param {Response} res - The response to the request
 * @async
 */
module.exports.banMember = async (req, res) => {
	try {
		const user = await User.findById(req.params.userId);
		const pact = await Pact.findById(req.params.pactId);

		// Can't ban a user from a pact if they aren't a member
		if (!pact.members.includes(user._id)) {
			throw Error(PACT_MESSAGES.CANT_BAN_NON_MEMBER);
		}

		// Can't ban other moderators from a pact
		if (pact.moderators.includes(user._id)) {
			throw Error(PACT_MESSAGES.CANT_BAN_MODERATOR);
		}

		// Can't ban someone who is already banned from a pact
		if (pact.bannedUsers.includes(user._id)) {
			throw Error(PACT_MESSAGES.ALREADY_BANNED);
		}

		await User.findByIdAndUpdate(user._id, { $pull: { pacts: pact._id } });
		await Pact.findByIdAndUpdate(pact._id, { $pull: { members: user._id } });
		await Pact.findByIdAndUpdate(pact._id, { $push: { bannedUsers: user._id } });

		res.json(jsonResponse(PACT_MESSAGES.SUCCESSFUL_BAN, []));
	}
	catch (err) {
		res.status(404).json(jsonResponse(null, [jsonError(null, err.message)]));
	}
}

/**
 * Promotes a member of the pact to a moderator.
 * The user making the request must be a moderator of the pact.
 * @param {Request} req - The request
 * @param {Response} res - The response to the request
 * @async
 */
module.exports.promoteMember = async (req, res) => {
	try {
		const user = await User.findById(req.params.userId);
		const pact = await Pact.findById(req.params.pactId);

		// Can't promote a user if they aren't a member of the pact
		if (!pact.members.includes(user._id)) {
			throw Error(PACT_MESSAGES.CANT_PROMOTE_NON_MEMBER);
		}

		// Can't promote someone who is already moderator
		if (pact.moderators.includes(user._id)) {
			throw Error(PACT_MESSAGES.CANT_PROMOTE_MODERATOR);
		}

		await Pact.findByIdAndUpdate(pact._id, { $push: { moderators: user._id } });

		res.json(jsonResponse(PACT_MESSAGES.SUCCESSFUL_PROMOTION, []));
	}
	catch (err) {
		res.status(404).json(jsonResponse(null, [jsonError(null, err.message)]));
	}
}

/**
 * Revokes a the ban of a member, so they become again a normal member.
 * The user making the request must be a moderator of the pact.
 * @param {Request} req - The request
 * @param {Response} res - The response to the request
 * @async
 */
module.exports.revokeBan = async (req, res) => {
	try {
		const user = await User.findById(req.params.userId);
		const pact = await Pact.findById(req.params.pactId);

		// Can't revoke a ban if user is not banned from pact
		if (!pact.bannedUsers.includes(user._id)) {
			throw Error(PACT_MESSAGES.NOT_BANNED);
		}

		await Pact.findByIdAndUpdate(pact._id, { $push: { members: user._id } });
		await Pact.findByIdAndUpdate(pact._id, { $pull: { bannedUsers: user._id } });
		await User.findByIdAndUpdate(user._id, { $push: { pacts: pact._id } });

		res.json(jsonResponse(PACT_MESSAGES.SUCCESSFUL_REVOKE_BAN, []));
	}
	catch (err) {
		res.status(404).json(jsonResponse(null, [jsonError(null, err.message)]));
	}
}

/**
 * Makes the user who made the request leave a pact.
 * It fails if the user is the only moderator of their pact,
 * or if they are the last (and only) member of their pact.
 * The pact's id is given in the params of the link.
 * @param {Request} req - The request
 * @param {Response} res - The response to the request
 * @async
 */
module.exports.leavePact = async (req, res) => {
	try {
		const user = await User.findById(req.user._id);
		const pact = await Pact.findById(req.params.pactId);

		if(pact.members.length === 1) {
			res.status(401).json(jsonResponse(null, [jsonError(null, PACT_MESSAGES.LEAVE.ALONE)]));
		} else if(pact.moderators.length === 1 && pact.moderators[0]._id.toString() === user._id.toString()) {
			res.status(401).json(jsonResponse(null, [jsonError(null, PACT_MESSAGES.LEAVE.ONLY_MODERATOR)]));
		} else {
			// Make the user leave the pact
			await Pact.findByIdAndUpdate(pact._id, { $pull: { members: user._id, moderators: user._id } });
			await User.findByIdAndUpdate(user._id, { $pull: { pacts: pact._id } });
			res.status(201).json(jsonResponse(PACT_MESSAGES.LEAVE.SUCCESSFUL, []));
		}
	}
	catch (err) {
		res.status(404).json(jsonResponse(null, [jsonError(null, err.message)]));
	}
}

/**
 * Helper to delete recursively all comments (all children comments 
 * as well as parent comments)
 * @param {[Comment]} comments - A list of comments
 * @async
 */
async function deleteAllComments(comments) {
	for (let i = 0; i < comments.length; i++) {
		const actual = await Comment.findById(comments[i]._id);
		if(actual.childComments !== undefined && actual.childComments !== null && actual.childComments.length !== 0) {
			await deleteAllComments(actual.childComments);
		}
		await Comment.findByIdAndDelete(actual._id);
	}
}

/**
 * Deletes a pact. All posts and comments made in the post are also deleted.
 * It fails if the user is not a moderator, or if they are not the only moderator
 * of the pact.
 * @param {Request} req - The request
 * @param {Response} res - The response to the request
 * @async
 */
module.exports.deletePact = async (req, res) => {
	try {
		const pact = await Pact.findById(req.params.pactId);

		// Already checked via middleware that the user is a mod
		if(pact.moderators.length !== 1) {
			res.status(401).json(jsonResponse(null, [jsonError(null, PACT_MESSAGES.DELETE.TOO_MANY_MODERATORS)]));
		} else {
			// Make every user leave the pact
			for (let i = 0; i < pact.members.length; i++) {
				const actual = pact.members[i];
				await User.findByIdAndUpdate(actual._id, { $pull: { pacts: pact._id } });
			}
			// Delete all posts and comments
			for (let i = 0; i < pact.posts.length; i++) {
				const actual = await Post.findById(pact.posts[i]._id);
				if(actual.comments !== undefined && actual.comments !== null && actual.comments.length > 0) {
					await deleteAllComments(actual.comments);
				}
				await Post.findByIdAndDelete(actual._id);
			}
			await University.findByIdAndUpdate(req.user.university._id, { $pull: { pacts: pact._id } });
			// Delete the pact itself
			await Pact.findByIdAndDelete(pact._id);
			res.status(201).json(jsonResponse(PACT_MESSAGES.DELETE.SUCCESSFUL, []));
		}
	}
	catch (err) {
		res.status(404).json(jsonResponse(null, [jsonError(null, err.message)]));
		console.log(err.message);
	}
}