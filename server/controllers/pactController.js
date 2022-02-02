const Pact = require("../models/Pact");

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

		if (!university){
			throw Error("User not authenticated");
		}

		const pacts = Pact.find({ university });

		res.status(200).json(jsonResponse(pacts, []));
	} 
  catch (err) {
		res.status(400).json(jsonResponse(null, [jsonError(null, err.message)]));
	}
};


