const Pact = require("../models/Pact");
const University = require("../models/University");
const User = require("../models/User");
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
		res.status(200).json(jsonResponse(req.pact, []));
	} 
  catch (err) {
		res.status(400).json(jsonResponse(null, [jsonError(null, err.message)]));
	}
};

// PUT pact (by id)
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
			throw Error("You don't have permission to update this pact.");
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