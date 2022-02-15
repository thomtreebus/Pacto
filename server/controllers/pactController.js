const Pact = require("../models/Pact");
const University = require("../models/University");
const User = require("../models/User");
const {jsonResponse, jsonError} = require("../helpers/responseHandlers");

// POST pact
module.exports.pactPost = async (req, res) => {
	try {
    const { name } = req.body;
    const user = req.user;

    const pact = await Pact.create({ name, university:user.university, members:[user], moderators:[user] });

		res.status(201).json(jsonResponse(pact, []));
	} 
  catch (err) {
		res.status(400).json(jsonResponse(null, [jsonError(null, err.message)]));
	}
};

// GET pacts (all pacts in user's hub)
module.exports.pactsGet = async (req, res) => {
	try {
    const university = req.user.university;

		const pacts = await Pact.find({ university });
		pacts.forEach(async pact => {
			await pact.populate({path: 'members', model: User})
			.populate({path: 'moderators', model: User})
			.populate({path: 'university', model: Univeristy});
		});

		res.status(200).json(jsonResponse(pacts, []));
	} 
  catch (err) {
		res.status(400).json(jsonResponse(null, [jsonError(null, err.message)]));
	}
};

// GET pact (by id)
module.exports.pactGet = async (req, res) => {
	let status = 400;
	try {
    const university = req.user.university;

		if (!university){
			throw Error("User not authenticated");
		}

		const pact = await Pact.findOne({ university, _id:req.params.id });

		if (!pact){
			status = 404;
			throw Error("Pact not found");
		}

		await pact.populate({path: 'university', model: University})
		.populate({path: 'members', model: User})
		.populate({path: 'moderators', model: User});

		res.status(200).json(jsonResponse(pact, []));
	} 
  catch (err) {
		res.status(status).json(jsonResponse(null, [jsonError(null, err.message)]));
	}
};

