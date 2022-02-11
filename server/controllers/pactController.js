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
		req.user.university.pacts.push(pact);
		req.user.university.save();

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

// GET pacts (all pacts in user's hub)
// module.exports.pactsGet = async (req, res) => {
// 	try {
//     const university = req.user.university;

// 		if (!university){
// 			throw Error("User not authenticated");
// 		}

// 		const pacts = await Pact.find({ university });
// 		pacts.forEach(async pact => {
// 			await pact.populate({path: 'members', model: User})
// 			.populate({path: 'moderators', model: User})
// 			.populate({path: 'university', model: University});
// 		});

// 		res.status(200).json(jsonResponse(pacts, []));
// 	} 
//   catch (err) {
// 		res.status(400).json(jsonResponse(null, [jsonError(null, err.message)]));
// 	}
// };

// GET pact (by id)
module.exports.pactGet = async (req, res) => {
	let status = 400;
	try {
    const university = req.user.university;

		if (!university){
			throw Error(MESSAGES.AUTH.IS_NOT_LOGGED_IN);
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

