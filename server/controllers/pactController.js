const Pact = require("../models/Pact");
const University = require("../models/University");
const User = require("../models/User");
const Post = require("../models/Post");
const {jsonResponse, jsonError} = require("../helpers/responseHandlers");
const handleFieldErrors = require('../helpers/errorHandler');
const { MESSAGES, PACT_MESSAGES } = require("../helpers/messages")

// POST pact
module.exports.pactPost = async (req, res) => {
	let jsonErrors = [];

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
		const allErrors = handleFieldErrors(err);
    if(allErrors){
			allErrors.forEach((myErr) => jsonErrors.push(myErr));
		} 
		else {
			jsonErrors.push(jsonError(null, err.message));
		}
		res.status(400).json(jsonResponse(null, jsonErrors));
	}
};

// GET pact (by id)
module.exports.pactGet = async (req, res) => {
	try {
		const pact = req.pact;
		await pact.populate({ path: 'university', model: University });
		await pact.populate({ path: "members", model: User });
		await pact.populate({ path: "moderators", model: User });
		await pact.populate({ path: "posts", model: Post });
		res.status(200).json(jsonResponse(pact, []));
	} 
  catch (err) {
		res.status(400).json(jsonResponse(null, [jsonError(null, err.message)]));
	}
};

module.exports.joinPact = async (req, res) => {

	try {
		const potentialPacts = req.user.university.pacts.filter(pact => pact._id.toString() === req.params.id);

		if(!potentialPacts.length){
			throw Error(PACT_MESSAGES.NOT_FOUND);
		}  

		const targetUser = await User.findById(req.user._id);
		const targetPact = await Pact.findById(req.params.id);

		targetUser.pacts.push(targetPact);
		targetPact.members.push(targetUser);
		
		await targetPact.save();
		await targetUser.save();

		res.json(jsonResponse(PACT_MESSAGES.SUCCESSFUL_JOIN, []));
	}
	catch (err) {
		res.status(404).json(jsonResponse(null, [jsonError(null, PACT_MESSAGES.NOT_FOUND)]));
	}
};

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


