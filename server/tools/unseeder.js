const User = require("../models/User");
const Pact = require("../models/Pact");
const University = require("../models/University");
const EmailVerificationCode = require("../models/EmailVerificationCode");

async function unseed() {
	await User.deleteMany({});
	await Pact.deleteMany({});
	await University.deleteMany({});
	await University.deleteMany({});
	await EmailVerificationCode.deleteMany({});
	console.log("Finished unseeding");
}

module.exports.unseed = unseed;